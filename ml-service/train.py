import os
import json
import time
import random
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import confusion_matrix, classification_report
import timm

# ==========================
# Reproducibility
# ==========================

SEED = 42

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
torch.cuda.manual_seed_all(SEED)

torch.backends.cudnn.benchmark = False

# ==========================
# Device Configuration
# ==========================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("=" * 60)
print("HydroNova Plant Disease Training")
print("=" * 60)
print(f"Device : {device}")

if device.type == "cuda":
    print("GPU :", torch.cuda.get_device_name(0))

print("=" * 60)

# ==========================
# Dataset Paths
# ==========================

TRAIN_DIR = "dataset/Train"
VAL_DIR = "dataset/Validation"
TEST_DIR = "dataset/Test"

# ==========================
# Image Transformations
# ==========================

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])

val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])

# ==========================
# Load Dataset
# ==========================

train_dataset = datasets.ImageFolder(
    TRAIN_DIR,
    transform=train_transform
)

val_dataset = datasets.ImageFolder(
    VAL_DIR,
    transform=val_transform
)

test_dataset = datasets.ImageFolder(
    TEST_DIR,
    transform=val_transform
)

# ==========================
# Data Loaders
# ==========================

NUM_WORKERS = 0

train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True,
    num_workers=NUM_WORKERS,
    pin_memory=(device.type == "cuda"),
    persistent_workers=(NUM_WORKERS > 0)
)

val_loader = DataLoader(
    val_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=(device.type == "cuda"),
    persistent_workers=(NUM_WORKERS > 0)
)

test_loader = DataLoader(
    test_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=NUM_WORKERS,
    pin_memory=(device.type == "cuda"),
    persistent_workers=(NUM_WORKERS > 0)
)

# ==========================
# Classes
# ==========================

classes = train_dataset.classes

print("\nDetected Classes")

for i, c in enumerate(classes):
    print(f"{i} -> {c}")

print("\nTotal Classes :", len(classes))

# Save class names

os.makedirs("models", exist_ok=True)

with open("models/class_names.json", "w") as f:
    json.dump(classes, f)

print("\nClass names saved successfully.")
print("=" * 60)

# ==========================
# Model
# ==========================

MODEL_NAME = "tf_efficientnetv2_s.in21k_ft_in1k"
DROPOUT_RATE = 0.3

model = timm.create_model(
    MODEL_NAME,
    pretrained=True,
    num_classes=len(classes),
    drop_rate=DROPOUT_RATE
)
model = model.to(device)

print(f"\nModel : {MODEL_NAME}")
print("Total Parameters :", sum(p.numel() for p in model.parameters()))
print("=" * 60)

# ==========================
# Loss, Optimizer, Scheduler
# ==========================

EPOCHS = 20
LR = 3e-4
WEIGHT_DECAY = 1e-4
PATIENCE = 5  # early stopping patience

criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LR,
    weight_decay=WEIGHT_DECAY
)

scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
    optimizer,
    T_max=EPOCHS
)

# Mixed precision scaler (only meaningful on CUDA, harmless otherwise)
scaler = torch.amp.GradScaler(enabled=(device.type == "cuda"))

# Save training configuration for future reference
config = {
    "model": MODEL_NAME,
    "dropout_rate": DROPOUT_RATE,
    "epochs": EPOCHS,
    "batch_size": 32,
    "lr": LR,
    "weight_decay": WEIGHT_DECAY,
    "patience": PATIENCE,
    "seed": SEED,
    "image_size": 224,
}

with open("models/training_config.json", "w") as f:
    json.dump(config, f, indent=2)

print("Training configuration saved to models/training_config.json")
print("=" * 60)

# ==========================
# Train / Validate Helpers
# ==========================

def run_epoch(loader, training):
    model.train(mode=training)

    total_loss = 0.0
    total_correct = 0
    total_samples = 0

    for images, labels in loader:
        images = images.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        if training:
            optimizer.zero_grad(set_to_none=True)

        with torch.set_grad_enabled(training):
            with torch.amp.autocast(device_type=device.type, enabled=(device.type == "cuda")):
                outputs = model(images)
                loss = criterion(outputs, labels)

            if training:
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()

        batch_size = images.size(0)
        total_loss += loss.item() * batch_size
        total_correct += (outputs.argmax(dim=1) == labels).sum().item()
        total_samples += batch_size

    avg_loss = total_loss / total_samples
    accuracy = total_correct / total_samples
    return avg_loss, accuracy


@torch.no_grad()
def evaluate(loader):
    return run_epoch(loader, training=False)


@torch.no_grad()
def evaluate_detailed(loader):
    """Like evaluate(), but also returns every prediction and true label
    so we can compute a confusion matrix and per-class precision/recall."""
    model.eval()

    all_preds = []
    all_labels = []
    total_loss = 0.0
    total_samples = 0

    for images, labels in loader:
        images = images.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        with torch.amp.autocast(device_type=device.type, enabled=(device.type == "cuda")):
            outputs = model(images)
            loss = criterion(outputs, labels)

        preds = outputs.argmax(dim=1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

        total_loss += loss.item() * images.size(0)
        total_samples += images.size(0)

    avg_loss = total_loss / total_samples
    return avg_loss, all_labels, all_preds


# ==========================
# Training Loop
# ==========================

print("\nStarting Training")
print("=" * 60)

best_val_acc = 0.0
epochs_without_improvement = 0
history = {
    "train_loss": [],
    "train_acc": [],
    "val_loss": [],
    "val_acc": [],
}

for epoch in range(1, EPOCHS + 1):
    start_time = time.time()

    train_loss, train_acc = run_epoch(train_loader, training=True)
    val_loss, val_acc = evaluate(val_loader)

    scheduler.step()

    elapsed = time.time() - start_time

    history["train_loss"].append(train_loss)
    history["train_acc"].append(train_acc)
    history["val_loss"].append(val_loss)
    history["val_acc"].append(val_acc)

    print(
        f"Epoch {epoch:02d}/{EPOCHS} | "
        f"Train Loss: {train_loss:.4f} Acc: {train_acc:.4f} | "
        f"Val Loss: {val_loss:.4f} Acc: {val_acc:.4f} | "
        f"LR: {scheduler.get_last_lr()[0]:.6f} | "
        f"Time: {elapsed:.1f}s"
    )

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        epochs_without_improvement = 0
        torch.save({
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "scheduler_state_dict": scheduler.state_dict(),
            "best_val_acc": best_val_acc
        }, "models/best_model.pth")
        print(f"  -> New best model saved (Val Acc: {best_val_acc:.4f})")
    else:
        epochs_without_improvement += 1
        print(f"  -> No improvement ({epochs_without_improvement}/{PATIENCE})")

    if epochs_without_improvement >= PATIENCE:
        print("\nEarly stopping triggered.")
        break

print("=" * 60)
print(f"Best Validation Accuracy : {best_val_acc:.4f}")

# Save training history
with open("models/training_history.json", "w") as f:
    json.dump(history, f, indent=2)

print("Training history saved to models/training_history.json")
print("=" * 60)

# ==========================
# Final Test Evaluation
# ==========================

print("\nEvaluating on Test Set (best checkpoint)")

checkpoint = torch.load(
    "models/best_model.pth",
    map_location=device
)
model.load_state_dict(checkpoint["model_state_dict"])
test_loss, all_labels, all_preds = evaluate_detailed(test_loader)
test_acc = sum(int(p == l) for p, l in zip(all_preds, all_labels)) / len(all_labels)

print(f"Test Loss : {test_loss:.4f}")
print(f"Test Accuracy : {test_acc:.4f}")

print("\nConfusion Matrix (rows = actual, cols = predicted)")
print("Classes:", classes)
print(confusion_matrix(all_labels, all_preds))

print("\nPer-Class Precision / Recall / F1")
print(classification_report(all_labels, all_preds, target_names=classes))
print("=" * 60)

# ==========================
# Final Summary
# ==========================

print("\nTraining Complete\n")
print(f"Best Validation Accuracy : {best_val_acc * 100:.2f}%")
print(f"Test Accuracy            : {test_acc * 100:.2f}%")
print("\nModel Saved:")
print(" - models/best_model.pth")
print(" - models/class_names.json")
print(" - models/training_history.json")
print(" - models/training_config.json")