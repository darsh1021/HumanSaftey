import os

MODEL_PATH = os.getenv("MODEL_PATH", "models/yolov8n.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))
