# app.py
from flask import Flask
from flask_cors import CORS
from config import Config

# ───────────────────────────────
# CRITICAL: Import the ONE AND ONLY db from models
# ───────────────────────────────
from models import db  # ← This is the correct db instance!

# Ensure all models are imported (so tables get registered)
import models  # This triggers Patient, Result import

import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS configuration for production deployment (Vercel & local)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    # Remove the second CORS(app) if you want to restrict origins

  

    # ───────────────────────────────
    # THIS IS THE FIX: Use db.init_app(app) NOT init_db(app)
    # ───────────────────────────────
    db.init_app(app)

    # Create tables if they don't exist (safe to run every time)
    with app.app_context():
        db.create_all()  # ← Creates patients & results tables
        app.logger.info("Database tables ensured (db.create_all())")

    # Register blueprints
    from routes.health import health_bp
    from routes.predict import predict_bp
    from routes.auth import auth_bp
    from routes.patients import patients_bp
    app.register_blueprint(health_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(patients_bp)

    app.logger.info("Application created and blueprints registered")
    return app



# Top-level app instance required by Vercel's Python runtime
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)