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

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS
    FRONTEND_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
    CORS(app, resources={r"/*": {"origins": FRONTEND_ORIGINS}}, supports_credentials=True)
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


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)  
    