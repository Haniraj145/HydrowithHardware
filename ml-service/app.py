from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

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

    file_path = str(UPLOAD_DIR / file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_image(file_path)

    try:
        result["kindwise"] = get_kindwise_analysis(file_path)
    except Exception as e:
        result["kindwise"] = {"available": False, "error": str(e)}

    os.remove(file_path)

    return result