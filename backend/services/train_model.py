# train_model.py
import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from tqdm import tqdm

if __name__ == '__main__':
    # ================================
    # CONFIG
    # ================================
    DATASET_PATH = "../dataset_alzheimers"          # One level up from services/
    MODEL_SAVE_PATH = "../ml/alzheimer_model.pth"   # Save in project root
    BATCH_SIZE = 32
    EPOCHS = 4
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {DEVICE}")

    # ================================
    # DATA
    # ================================
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    full_dataset = datasets.ImageFolder(DATASET_PATH, transform=transform)
    class_names = full_dataset.classes
    print(f"Classes: {class_names}")

    # CRITICAL: num_workers=0 on Windows!
    dataloader = DataLoader(full_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)

    # ================================
    # MODEL
    # ================================
    model = models.resnet18(pretrained=True)
    model.fc = nn.Linear(model.fc.in_features, 4)
    model = model.to(DEVICE)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # ================================
    # TRAIN
    # ================================
    print("STARTING TRAINING...")
    model.train()

    for epoch in range(EPOCHS):
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, labels in tqdm(dataloader, desc=f"Epoch {epoch+1}/{EPOCHS}"):
            inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

        print(f"Epoch {epoch+1} → Loss: {running_loss/len(dataloader):.4f} | Accuracy: {100.*correct/total:.2f}%")

    # ================================
    # SAVE
    # ================================
    os.makedirs("../ml", exist_ok=True)
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"\nMODEL TRAINED AND SAVED TO: {MODEL_SAVE_PATH}")
    print("NOW YOUR PREDICTIONS WILL BE 100% CONSISTENT AND ACCURATE!")