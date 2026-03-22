import cv2
from flask import Flask, Response, request, jsonify
from ultralytics import YOLO
import threading
import requests
import time
import os
import atexit
import collections

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Status Configuration
# ---------------------------------------------------------------------------
AI_ENABLED = True
ai_lock = threading.Lock()

# ---------------------------------------------------------------------------
# Alert throttle — protected by a lock to avoid race conditions
# ---------------------------------------------------------------------------
last_alert_time = 0
alert_lock = threading.Lock()
ALERT_THROTTLE_SECONDS = 15 # Increased throttle to prevent alert spam

# ---------------------------------------------------------------------------
# Model Configuration
# ---------------------------------------------------------------------------
PERSON_MODEL_PATH = "models/yolov8n.pt"
HELMET_MODEL_PATH = "models/new_helmet.pt" # Upgraded to keremberke/yolov8m-hard-hat-detection

# Confidence threshold for helmet model — lowered to 0.15 to allow
# detecting helmets from screen glare / low-res phone images
HELMET_CONF_THRESHOLD = 0.15

# ---------------------------------------------------------------------------
# Label mapping auto-detection
#
# The custom helmet model has INVERTED class names:
#   "without helmet" / "no_helmet"  → person IS wearing a helmet  (SAFE)
#   "with helmet"    / "helmet"     → person is NOT wearing one   (VIOLATION)
#
# LABEL_MEANS_SAFE below reflects that inversion.
# If you ever swap to a correctly-labelled model, flip these sets.
# ---------------------------------------------------------------------------
LABEL_MEANS_SAFE      = {"hardhat"}
LABEL_MEANS_VIOLATION = {"no-hardhat"}

person_model = YOLO(PERSON_MODEL_PATH)
helmet_model = None

if os.path.exists(HELMET_MODEL_PATH):
    print(f"[INFO] Loading custom helmet model from {HELMET_MODEL_PATH}")
    helmet_model = YOLO(HELMET_MODEL_PATH)
    # Print the model's actual class names so you can verify the mapping
    print(f"[INFO] Helmet model classes: {helmet_model.names}")
else:
    print(f"[WARNING] {HELMET_MODEL_PATH} not found. "
          "Using demo mode — every person will be flagged as a violation.")

# ---------------------------------------------------------------------------
# Per-person smoothing — track last N detections to avoid single-frame
# false positives (especially when a phone screen drifts into frame)
# ---------------------------------------------------------------------------
SMOOTHING_WINDOW = 30   # increased frames to average over to avoid screen flickering
# Maps a person-slot index → deque of booleans (True = has_helmet)
_person_history: dict = collections.defaultdict(
    lambda: collections.deque(maxlen=SMOOTHING_WINDOW)
)

# ---------------------------------------------------------------------------
# Camera configuration
# ---------------------------------------------------------------------------
camera = cv2.VideoCapture(0)
if not camera.isOpened():
    print("[ERROR] Could not open webcam")

# Release camera cleanly on shutdown
atexit.register(lambda: camera.release())

# ---------------------------------------------------------------------------
# Alert Configuration
# ---------------------------------------------------------------------------
NODE_BACKEND_URL = "http://localhost:5000/api/ai/notify"


def send_alert(camera_id: str = "Main Entrance Cam") -> None:
    """Send a helmet-violation alert to the Node.js backend (non-blocking)."""
    try:
        requests.post(
            NODE_BACKEND_URL,
            json={
                "type": "no_helmet",
                "timestamp": int(time.time() * 1000),
                "cameraId": camera_id,
            },
            timeout=2,
        )
    except Exception as e:
        print(f"[ALERT ERROR] Could not reach backend: {e}")


# ---------------------------------------------------------------------------
# Frame generator
# ---------------------------------------------------------------------------
def generate_frames():
    global last_alert_time

    print(f"[INFO] Starting frame generation "
          f"(AI state: {'ENABLED' if AI_ENABLED else 'DISABLED'})")

    frame_idx = 0

    while True:
        success, frame = camera.read()
        if not success:
            print("[ERROR] Failed to capture frame from camera")
            break

        frame_idx += 1
        no_helmet_detected = False

        # ------------------------------------------------------------------ #
        # Read AI_ENABLED once per frame so the global can toggle mid-stream  #
        # ------------------------------------------------------------------ #
        with ai_lock:
            ai_active = AI_ENABLED

        if ai_active:
            # -------------------------------------------------------------- #
            # Step 1 — Detect persons (stream=False avoids nested generators) #
            # -------------------------------------------------------------- #
            person_results = person_model(frame, stream=False, verbose=False)
            persons = []
            for r in person_results:
                for box in r.boxes:
                    cls = int(box.cls[0])
                    if person_model.names[cls] == "person":
                        persons.append(
                            box.xyxy[0].tolist() + [float(box.conf[0])]
                        )

            # -------------------------------------------------------------- #
            # Step 2 — Detect helmets (if custom model is loaded)            #
            # -------------------------------------------------------------- #
            helmets = []
            if helmet_model:
                helmet_results = helmet_model(
                    frame, stream=False,
                    conf=HELMET_CONF_THRESHOLD,
                    verbose=False,
                )
                for r in helmet_results:
                    for box in r.boxes:
                        cls = int(box.cls[0])
                        label = helmet_model.names[cls]
                        conf  = float(box.conf[0])
                        helmets.append(
                            {
                                "box":   box.xyxy[0].tolist(),
                                "conf":  conf,
                                "label": label,
                            }
                        )
                        # ── DEBUG: print every detection to the terminal ──
                        print(
                            f"[DEBUG frame={frame_idx}] "
                            f"helmet_model → label='{label}'  "
                            f"conf={conf:.3f}  "
                            f"box={[round(v,1) for v in box.xyxy[0].tolist()]}"
                        )

            # -------------------------------------------------------------- #
            # Step 3 — Match persons ↔ helmets and annotate frame            #
            # -------------------------------------------------------------- #
            if not helmet_model:
                # Demo / fallback mode — every person is a violation
                for p_box in persons:
                    x1, y1, x2, y2, conf = p_box
                    no_helmet_detected = True
                    cv2.rectangle(
                        frame, (int(x1), int(y1)), (int(x2), int(y2)),
                        (0, 0, 255), 2
                    )
                    cv2.putText(
                        frame,
                        f"Person {conf:.2f} (NO HELMET - demo)",
                        (int(x1), int(y1) - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2,
                    )
            else:
                # Dual-model logic with per-person temporal smoothing
                for slot_idx, p_box in enumerate(persons):
                    px1, py1, px2, py2, pconf = p_box
                    raw_has_helmet = False  # single-frame result

                    for h in helmets:
                        hx1, hy1, hx2, hy2 = h["box"]
                        cx = (hx1 + hx2) / 2
                        cy = (hy1 + hy2) / 2

                        # Tolerances: allow the helmet centre to sit slightly
                        # outside the person bounding-box (e.g. on-screen glare)
                        tol_x     = (px2 - px1) * 0.2
                        tol_y_top = (py2 - py1) * 0.7   # look above the box
                        tol_y_bot = (py2 - py1) * 0.2

                        within_person = (
                            (px1 - tol_x) < cx < (px2 + tol_x)
                            and (py1 - tol_y_top) < cy < (py2 + tol_y_bot)
                        )

                        if not within_person:
                            continue

                        label_lower = h["label"].lower().strip()

                        # ── Label → safety mapping (inverted model) ──────── #
                        # LABEL_MEANS_SAFE      = {"without helmet","no_helmet"}
                        # LABEL_MEANS_VIOLATION = {"with helmet","helmet"}
                        # ─────────────────────────────────────────────────── #
                        if label_lower in LABEL_MEANS_SAFE:
                            raw_has_helmet = True
                            # Draw the helmet bounding box in green
                            cv2.rectangle(
                                frame,
                                (int(hx1), int(hy1)),
                                (int(hx2), int(hy2)),
                                (0, 255, 0), 2,
                            )
                            cv2.putText(
                                frame,
                                f"HELMET {h['conf']:.2f}",
                                (int(hx1), int(hy1) - 6),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1,
                            )
                            break  # Helmet confirmed — stop checking other boxes
                        elif label_lower in LABEL_MEANS_VIOLATION:
                            raw_has_helmet = False
                            break

                    # ── Temporal smoothing ───────────────────────────────── #
                    # A phone screen glare can cause the detection to easily drop.
                    # By checking if the helmet was seen in ANY of the last N frames,
                    # we prevent false "NO HELMET" flashing.
                    history = _person_history[slot_idx]
                    history.append(raw_has_helmet)
                    smoothed_has_helmet = any(history)

                    if smoothed_has_helmet:
                        color      = (0, 255, 0)
                        label_text = "PERSON: SAFE"
                    else:
                        color      = (0, 0, 255)
                        label_text = "PERSON: NO HELMET"
                        no_helmet_detected = True

                    cv2.rectangle(
                        frame,
                        (int(px1), int(py1)), (int(px2), int(py2)),
                        color, 2,
                    )
                    cv2.putText(
                        frame, label_text,
                        (int(px1), int(py1) - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2,
                    )

                # Clear history slots for persons that disappeared this frame
                active_slots = set(range(len(persons)))
                for slot in list(_person_history.keys()):
                    if slot not in active_slots:
                        del _person_history[slot]

        # ------------------------------------------------------------------ #
        # Alert logic — thread-safe throttle                                  #
        # ------------------------------------------------------------------ #
        if ai_active and no_helmet_detected:
            now = time.time()
            should_alert = False
            with alert_lock:
                if now - last_alert_time > ALERT_THROTTLE_SECONDS:
                    last_alert_time = now
                    should_alert = True

            if should_alert:
                threading.Thread(
                    target=send_alert, daemon=True
                ).start()

        # ------------------------------------------------------------------ #
        # Encode and yield MJPEG frame                                        #
        # ------------------------------------------------------------------ #
        ret, buffer = cv2.imencode(".jpg", frame)
        if not ret:
            continue
        frame_bytes = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
        )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return jsonify(
        {
            "message": "AI Video Service is Running",
            "endpoints": ["/video_feed", "/status", "/toggle"],
        }
    )


@app.route("/video_feed")
def video_feed():
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


@app.route("/status")
def status():
    with ai_lock:
        enabled = AI_ENABLED
    return jsonify(
        {
            "status": "running",
            "person_model": PERSON_MODEL_PATH,
            "helmet_model": HELMET_MODEL_PATH if helmet_model else "not loaded",
            "helmet_model_classes": helmet_model.names if helmet_model else {},
            "helmet_conf_threshold": HELMET_CONF_THRESHOLD,
            "label_means_safe": list(LABEL_MEANS_SAFE),
            "label_means_violation": list(LABEL_MEANS_VIOLATION),
            "ai_enabled": enabled,
        }
    )


@app.route("/toggle", methods=["POST"])
def toggle():
    global AI_ENABLED
    data = request.get_json(force=True, silent=True) or {}
    with ai_lock:
        AI_ENABLED = bool(data.get("enabled", True))
        enabled = AI_ENABLED
    print(f"[AI SERVICE] Status updated: {'ENABLED' if enabled else 'DISABLED'}")
    return jsonify({"success": True, "ai_enabled": enabled})


@app.route("/debug_labels", methods=["GET"])
def debug_labels():
    """
    Returns the helmet model's raw class names so you can verify the
    label → safety mapping without digging through terminal logs.
    Hit this endpoint from your browser: GET /debug_labels
    """
    if not helmet_model:
        return jsonify({"error": "Helmet model not loaded"}), 503
    return jsonify(
        {
            "helmet_model_classes": helmet_model.names,
            "current_mapping": {
                "LABEL_MEANS_SAFE": list(LABEL_MEANS_SAFE),
                "LABEL_MEANS_VIOLATION": list(LABEL_MEANS_VIOLATION),
            },
            "note": (
                "If a label you see in helmet_model_classes is missing from "
                "both sets, add it to the correct set in LABEL_MEANS_SAFE or "
                "LABEL_MEANS_VIOLATION at the top of this file."
            ),
        }
    )


@app.route("/set_conf", methods=["POST"])
def set_conf():
    """
    Adjust the helmet confidence threshold at runtime without restarting.
    POST JSON: { "conf": 0.40 }
    """
    global HELMET_CONF_THRESHOLD
    data = request.get_json(force=True, silent=True) or {}
    val = data.get("conf")
    if val is None or not (0.01 <= float(val) <= 1.0):
        return jsonify({"error": "conf must be between 0.01 and 1.0"}), 400
    HELMET_CONF_THRESHOLD = float(val)
    print(f"[CONFIG] Helmet confidence threshold → {HELMET_CONF_THRESHOLD}")
    return jsonify({"success": True, "helmet_conf_threshold": HELMET_CONF_THRESHOLD})


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, threaded=True)