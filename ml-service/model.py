import json
from pathlib import Path
import torch
import timm

# ==========================
# Device
# ==========================

BASE_DIR = Path(__file__).resolve().parent
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ==========================
# Load Class Names
# ==========================

with open(BASE_DIR / "models" / "class_names.json", "r") as f:
    classes = json.load(f)

# ==========================
# Model Configuration
# ==========================

MODEL_NAME = "tf_efficientnetv2_s.in21k_ft_in1k"
DROPOUT_RATE = 0.3

# ==========================
# Create Model
# ==========================

model = timm.create_model(
    MODEL_NAME,
    pretrained=False,
    num_classes=len(classes),
    drop_rate=DROPOUT_RATE
)

# ==========================
# Load Trained Weights
# ==========================

checkpoint = torch.load(
    BASE_DIR / "models" / "best_model.pth",
    map_location=device
)

model.load_state_dict(checkpoint["model_state_dict"])

model.to(device)
model.eval()

print("[AI Model] Loaded Successfully")