from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid

from predict import predict_image
from kindwise_client import get_kindwise_analysis

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="HydroNova AI API")

# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Upload Folder
# ==========================

UPLOAD_DIR = BASE_DIR / "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# ==========================
# Health Check
# ==========================

@app.get("/")
def home():
    return {
        "message": "HydroNova AI Service Running"
    }

# ==========================
# Prediction Endpoint
# ==========================

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    ext = Path(file.filename or "image.jpg").suffix or ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = str(UPLOAD_DIR / unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = predict_image(file_path)

        try:
            result["kindwise"] = get_kindwise_analysis(file_path)
        except Exception as e:
            result["kindwise"] = {"available": False, "error": str(e)}

        return result
    finally:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass