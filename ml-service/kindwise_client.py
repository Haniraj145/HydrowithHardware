import os
from pathlib import Path
import base64
import requests
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

KINDWISE_API_KEY = os.getenv("KINDWISE_API_KEY")
KINDWISE_URL = "https://api.plant.id/v3/identification"

DISEASE_DETAILS = ["description", "treatment", "cause", "common_names"]


def get_kindwise_analysis(image_path: str) -> dict:
    """Calls the Kindwise (Plant.id) API for a detailed disease health
    assessment. Returns a dict describing the top suggestion, its treatment
    info, and a few alternative suggestions. If the API key is missing or
    the request fails, returns {"available": False, "error": ...} instead
    of raising, so a Kindwise outage never breaks the main prediction.
    """
    if not KINDWISE_API_KEY:
        return {"available": False, "error": "KINDWISE_API_KEY not set"}

    try:
        with open(image_path, "rb") as f:
            image_b64 = base64.b64encode(f.read()).decode("ascii")

        response = requests.post(
            KINDWISE_URL,
            params={"details": ",".join(DISEASE_DETAILS)},
            headers={"Api-Key": KINDWISE_API_KEY},
            json={
                "images": [image_b64],
                "health": "all",
            },
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()

        result = data.get("result", {})
        is_healthy = result.get("is_healthy", {}).get("binary", True)
        disease_block = result.get("disease", {})
        suggestions = disease_block.get("suggestions", [])

        if not suggestions:
            return {
                "available": True,
                "healthy": is_healthy,
                "disease": "Healthy" if is_healthy else "Unknown",
                "confidence": round(
                    result.get("is_healthy", {}).get("probability", 0) * 100, 2
                ),
                "description": None,
                "cause": None,
                "treatment": None,
                "alternatives": [],
            }

        top = suggestions[0]
        details = top.get("details", {}) or {}
        treatment = details.get("treatment", {}) or {}

        alternatives = [
            {
                "name": s.get("name"),
                "probability": round(s.get("probability", 0) * 100, 2),
            }
            for s in suggestions[1:4]
        ]

        return {
            "available": True,
            "healthy": is_healthy,
            "disease": top.get("name", "Unknown"),
            "confidence": round(top.get("probability", 0) * 100, 2),
            "description": details.get("description"),
            "cause": details.get("cause"),
            "treatment": {
                "biological": treatment.get("biological"),
                "chemical": treatment.get("chemical"),
                "prevention": treatment.get("prevention"),
            },
            "alternatives": alternatives,
        }

    except Exception as e:
        return {"available": False, "error": str(e)}