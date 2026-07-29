# services/model_service.py
import os
import torch
import torch.nn as nn
from torchvision import models
from flask import current_app

# singleton holder
_MODEL = None
_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CLASS_NAMES = ["Normal", "MCI", "Alzheimer"]

def _build_default_model(num_classes=len(CLASS_NAMES), use_pretrained=False):
    # use_pretrained=False to avoid automatic weight downloads during setup
    model = models.resnet18(pretrained=use_pretrained)
    in_f = model.fc.in_features
    model.fc = nn.Linear(in_f, num_classes)
    return model

def load_model():
    """
    Load model once (singleton). If a model file exists at MODEL_PATH it will try to load it.
    Otherwise it returns a default ResNet18 head (untrained if use_pretrained=False).
    """
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    model_path = current_app.config.get("MODEL_PATH", "model/alzheimer_model.pth")
    if os.path.exists(model_path):
        try:
            # try loading state_dict into default architecture
            model = _build_default_model()
            state = torch.load(model_path, map_location=_DEVICE)

            if isinstance(state, dict):
                # common saved formats: direct state_dict or { 'model_state_dict': ... }
                if "model_state_dict" in state:
                    model.load_state_dict(state["model_state_dict"])
                else:
                    model.load_state_dict(state)
            else:
                # maybe a full scripted module was saved
                model = state

            current_app.logger.info("Loaded trained model from %s", model_path)
        except Exception as e:
            current_app.logger.exception("Failed to load model file, falling back to default model: %s", e)
            model = _build_default_model()
    else:
        current_app.logger.info("No model file at %s, using default ResNet18 (untrained).", model_path)
        model = _build_default_model()

    model = model.to(_DEVICE)
    model.eval()
    _MODEL = model
    return _MODEL

def predict(image_tensor):
    """
    image_tensor: torch.Tensor shaped (1,3,H,W)
    returns: dict { label, index, probabilities }
    """
    model = load_model()
    image_tensor = image_tensor.to(_DEVICE)

    with torch.no_grad():
        out = model(image_tensor)
        probs = torch.softmax(out, dim=1)[0].cpu().tolist()
        idx = int(torch.tensor(probs).argmax().item())
        label = CLASS_NAMES[idx]

    return {"label": label, "index": idx, "probabilities": probs}
