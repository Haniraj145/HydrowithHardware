from PIL import Image
from disease_info import DISEASE_INFO
import torch
from torchvision import transforms
from torchvision.transforms import functional as TF

from model import model, classes, device

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])

# Test-time augmentation: run the image through the model in a few variations
# and average the resulting probabilities for a more stable prediction.
TTA_TRANSFORMS = [
    lambda img: img,               # original
    lambda img: TF.hflip(img),     # horizontal flip
]


@torch.no_grad()
def predict_image(image_path):

    image = Image.open(image_path).convert("RGB")

    probs_sum = None
    for augment in TTA_TRANSFORMS:
        augmented = augment(image)
        tensor = transform(augmented).unsqueeze(0).to(device)
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)
        probs_sum = probs if probs_sum is None else probs_sum + probs

    probabilities = probs_sum / len(TTA_TRANSFORMS)
    confidence, predicted = torch.max(probabilities, dim=1)

    disease = classes[predicted.item()]
    print("Predicted disease:", disease)
    confidence = round(confidence.item() * 100, 2)

    info = DISEASE_INFO.get(
        disease,
        {
            "severity": "Unknown",
            "description": "No information available.",
            "recommendation": [],
            "nutrientDeficiency": "Unknown",
            "colorAnalysis": "Unknown",
            "dryLeaf": False,
            "risk": "Unknown",
            "cause": "Unknown",
            "npk": {"nitrogen": 0, "phosphorus": 0, "potassium": 0},
        },
    )

    return {
        "disease": disease,
        "confidence": confidence,
        "healthy": disease.lower() == "healthy",

        "severity": info["severity"],
        "risk": info["risk"],

        "cause": info["cause"],
        "description": info["description"],

        "recommendation": info["recommendation"],

        "nutrientDeficiency": info["nutrientDeficiency"],
        "colorAnalysis": info["colorAnalysis"],
        "dryLeaf": info["dryLeaf"],

        "npk": info["npk"],
    }