import os
import requests
from ultralytics import YOLO

# Provide a fallback auto-download mechanism if 'models' directory is empty
MODEL_DIR = "models"
MODEL_PATH = os.path.join(MODEL_DIR, "yolov8n.pt")

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR, exist_ok=True)

try:
    # ultralytics naturally handles downloading missing standard .pt scales 
    # but we can pass the explicit structure to force it securely
    model = YOLO(MODEL_PATH)
    print(f"[AI] Model loaded successfully: {MODEL_PATH}")
except Exception as e:
    print(f"[ERROR] Failed to load YOLO Model: {e}")
    # Backup load default and re-save
    model = YOLO("yolov8n.pt")
    model.save(MODEL_PATH)

def run_detection(frame):
    """
    Run YOLO detection exclusively on a single OpenCV frame context.
    Returns: [{"label": "person", "confidence": 0.95, "bbox": [x1, y1, x2, y2]}]
    """
    results = model(frame)
    detections = []
    
    for result in results:
        for box in result.boxes:
            # 1. Grab bounding box arrays natively [x1, y1, x2, y2]
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            # 2. Extract inference stat logic
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            
            # 3. Resolve string definition mappings (0 -> 'person', etc)
            label = model.names[class_id]
            
            detections.append({
                "label": label,
                "confidence": round(confidence, 3), # Limit deep floating strings
                "bbox": [x1, y1, x2, y2]
            })
            
    return detections
