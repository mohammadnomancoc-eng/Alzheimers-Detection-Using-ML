# services/explain_service.py
import os
import numpy as np
import cv2
import torch
from flask import current_app
from torchvision import transforms
from PIL import Image

from services.model_service import load_model

# Same preprocess used by model (224x224 + ImageNet norm)
_transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485,0.456,0.406],[0.229,0.224,0.225])
])

def make_gradcam(image_path, target_index, out_path):
    """
    Grad-CAM for ResNet-like model. Saves overlay to out_path and returns out_path.
    """
    model = load_model()
    device = next(model.parameters()).device

    # find last conv layer name (take the last Conv2d)
    last_conv = None
    for name, module in model.named_modules():
        if isinstance(module, torch.nn.Conv2d):
            last_conv = name

    if last_conv is None:
        raise RuntimeError("No conv layer found in model for Grad-CAM")

    activations = {}
    gradients = {}

    def forward_hook(module, inp, out):
        activations["value"] = out.detach()

    def backward_hook(module, grad_in, grad_out):
        gradients["value"] = grad_out[0].detach()

    # register hooks on the found conv layer
    for name, module in model.named_modules():
        if name == last_conv:
            module.register_forward_hook(forward_hook)
            module.register_backward_hook(backward_hook)
            break

    # prepare input
    img = Image.open(image_path).convert("RGB")
    orig = cv2.imread(image_path)
    x = _transform(img).unsqueeze(0).to(device)

    model.zero_grad()
    out = model(x)
    if target_index is None:
        target_index = int(out.argmax(dim=1).item())
    score = out[0, target_index]
    score.backward(retain_graph=True)

    act = activations["value"][0].cpu().numpy()   # (C,H,W)
    grad = gradients["value"][0].cpu().numpy()    # (C,H,W)
    weights = np.mean(grad, axis=(1,2))           # (C,)

    cam = np.zeros(act.shape[1:], dtype=np.float32)
    for i, w in enumerate(weights):
        cam += w * act[i]

    cam = np.maximum(cam, 0)
    cam = cv2.resize(cam, (orig.shape[1], orig.shape[0]))
    cam = cam - cam.min()
    cam = cam / (cam.max() + 1e-8)
    heat = (cam * 255).astype("uint8")
    heatmap = cv2.applyColorMap(heat, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(heatmap, 0.4, orig, 0.6, 0)

    cv2.imwrite(out_path, overlay)
    current_app.logger.info("Saved Grad-CAM overlay to %s", out_path)
    return out_path
