from fastapi import FastAPI
import cv2
import urllib.request
import numpy as np
from services.detection import run_detection
import uvicorn

app = FastAPI(title="AI Camera Safety Service")

@app.get("/")
def read_root():
    return {"message": "AI Service Running"}

# Internal standalone test routine block handling remote frame downloading logic 
# strictly to test bounding boxes prior to camera attachment
def test_model():
    print("[TEST] Setting up sample frame...")
    url = "https://ultralytics.com/images/zidane.jpg"
    req = urllib.request.urlopen(url)
    arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
    img = cv2.imdecode(arr, -1)
    
    print("[TEST] Analyzing bounding boxes using YOLO...")
    detections = run_detection(img)
    
    print(f"\n[OUTPUT] Found {len(detections)} targets natively:")
    for d in detections:
        print(f" -> {d['label']} ({d['confidence'] * 100:.1f}%) | BBox: {d['bbox']}")

if __name__ == "__main__":
    # Start the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
