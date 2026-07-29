# routes/health.py
from flask import Blueprint, jsonify, current_app

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health():
    current_app.logger.info("Health endpoint hit")
    return jsonify({"status": "ok", "service": "alzheimers-api"}), 200