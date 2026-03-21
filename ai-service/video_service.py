import cv2
from flask import Flask, Response, request, jsonify
from ultralytics import YOLO
import threading
import requests
import time
import os

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({"message": "AI Video Service is Running", "endpoints": ["/video_feed", "/status", "/toggle"]})

# Status Configuration
AI_ENABLED = True

# Model Configuration
PERSON_MODEL_PATH = "models/yolov8n.pt"
HELMET_MODEL_PATH = "models/helmet.pt"

person_model = YOLO(PERSON_MODEL_PATH)
helmet_model = None

if os.path.exists(HELMET_MODEL_PATH):
    print(f"[INFO] Loading custom helmet model from {HELMET_MODEL_PATH}")
    helmet_model = YOLO(HELMET_MODEL_PATH)
else:
    print(f"[WARNING] {HELMET_MODEL_PATH} not found. Using yolov8n.pt fallback for all detections.")

# Camera configuration
camera = cv2.VideoCapture(0)  # Use 0 for local webcam
if not camera.isOpened():
    print("[ERROR] Could not open webcam")

# Alert Configuration
NODE_BACKEND_URL = "http://localhost:5000/api/ai/notify"
last_alert_time = 0
ALERT_THROTTLE_SECONDS = 5

def generate_frames():
    global last_alert_time
    print(f"[INFO] Starting frame generation (AI state: {'ENABLED' if AI_ENABLED else 'DISABLED'})")
    while True:
        success, frame = camera.read()
        if not success:
            print("[ERROR] Failed to capture frame from camera")
            break
        
        # Inference (Only if AI is enabled)
        no_helmet_detected = False
        
        if AI_ENABLED:
            # Step 1: Detect Persons
            person_results = person_model(frame, stream=True)
            persons = []
            for r in person_results:
                for box in r.boxes:
                    cls = int(box.cls[0])
                    if person_model.names[cls] == 'person':
                        persons.append(box.xyxy[0].tolist() + [float(box.conf[0])])
            
            # Step 2: Detect Helmets (if model exists)
            helmets = []
            if helmet_model:
                helmet_results = helmet_model(frame, stream=True)
                for r in helmet_results:
                    for box in r.boxes:
                        cls = int(box.cls[0])
                        label = helmet_model.names[cls]
                        helmets.append({
                            "box": box.xyxy[0].tolist(),
                            "conf": float(box.conf[0]),
                            "label": label
                        })
            
            # Step 3: Match & Draw
            # If no helmet model, we fallback to treating every detected person as a violation (demo mode)
            if not helmet_model:
                for p_box in persons:
                    x1, y1, x2, y2, conf = p_box
                    no_helmet_detected = True
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
                    cv2.putText(frame, f"Person {conf:.2f} (NO HELMET)", (int(x1), int(y1) - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            else:
                # Use dual-model logic
                for p_box in persons:
                    px1, py1, px2, py2, pconf = p_box
                    has_helmet = False
                    
                    # Check for overlapping helmet detections
                    for h in helmets:
                        hx1, hy1, hx2, hy2 = h["box"]
                        # Simple overlap check: center of helmet is inside person box
                        cx, cy = (hx1 + hx2) / 2, (hy1 + hy2) / 2
                        if px1 < cx < px2 and py1 < cy < py2:
                            if h["label"] == 'helmet':
                                has_helmet = True
                                # Draw green box
                                cv2.rectangle(frame, (int(hx1), int(hy1)), (int(hx2), int(hy2)), (0, 255, 0), 2)
                            elif h["label"] == 'no_helmet':
                                has_helmet = False # Explicitly no helmet
                                break
                    
                    if not has_helmet:
                        no_helmet_detected = True
                        color = (0, 0, 255)
                        cv2.rectangle(frame, (int(px1), int(py1)), (int(px2), int(py2)), color, 2)
                        cv2.putText(frame, "PERSON: NO HELMET", (int(px1), int(py1) - 10), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                    else:
                        color = (0, 255, 0)
                        cv2.rectangle(frame, (int(px1), int(py1)), (int(px2), int(py2)), color, 2)
                        cv2.putText(frame, "PERSON: SAFE", (int(px1), int(py1) - 10), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # Alert logic (Only if AI is enabled)
        if AI_ENABLED and no_helmet_detected and (time.time() - last_alert_time > ALERT_THROTTLE_SECONDS):
            last_alert_time = time.time()
            # Send alert to Node.js backend
            try:
                requests.post(NODE_BACKEND_URL, json={
                    "type": "no_helmet",
                    "timestamp": int(time.time() * 1000),
                    "cameraId": "Main Entrance Cam"
                })
            except Exception as e:
                print(f"Error sending alert: {e}")
        
        # Encode as JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/status')
def status():
    return jsonify({"status": "running", "model": MODEL_PATH, "ai_enabled": AI_ENABLED})

@app.route('/toggle', methods=['POST'])
def toggle():
    global AI_ENABLED
    data = request.json
    AI_ENABLED = data.get('enabled', True)
    print(f"[AI SERVICE] Status updated: {'ENABLED' if AI_ENABLED else 'DISABLED'}")
    return jsonify({"success": True, "ai_enabled": AI_ENABLED})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=True)
