# services/storage_service.py
import os
from flask import current_app

def allowed_file(filename):
    return filename and filename.lower().endswith((".jpg", ".jpeg", ".png"))

def save_upload(fileobj, uniq):
    """
    Save uploaded file to UPLOAD_DIR with name <uniq>.jpg and return the full path.
    """
    upload_dir = current_app.config.get("UPLOAD_DIR", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{uniq}.jpg"
    path = os.path.join(upload_dir, filename)
    fileobj.save(path)
    current_app.logger.info("Saved upload to %s", path)
    return path
