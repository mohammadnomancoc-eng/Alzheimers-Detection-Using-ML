# utils/preprocess.py
from PIL import Image
import torch
from torchvision import transforms

_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

def preprocess(path):
    """
    Return a torch tensor shaped (1,3,224,224) ready to feed the model.
    """
    img = Image.open(path).convert("RGB")
    t = _transform(img).unsqueeze(0)   # adds batch dim
    return t
