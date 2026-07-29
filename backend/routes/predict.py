# routes/predict.py
import os
import uuid
import sqlalchemy
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, send_file, url_for

from services.storage_service import save_upload, allowed_file
from services.model_service import predict as model_predict
from services.explain_service import make_gradcam
from services.report_service import generate_report

from models import db
from models.patient import Patient
from models.result import Result

predict_bp = Blueprint("predict", __name__, url_prefix="/predict")

# Update this to match your model's class order!
CLASS_NAMES = ["Normal", "MildDemented", "ModerateDemented", "VeryMildDemented"]



@predict_bp.route("/", methods=["POST","OPTIONS"])
def predict_route():
    current_app.logger.info("Prediction request received")

    # 1. Image
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file = request.files["image"]
    if not file.filename or not allowed_file(file.filename):
        return jsonify({"error": "Invalid image"}), 400

    uniq = uuid.uuid4().hex
    img_path = save_upload(file, uniq)
    img_filename = os.path.basename(img_path)

    # 2. ONLY use fields that exist in your current Patient model
    patient_code = request.form.get("patient_code") or f"PT-{uniq[:8].upper()}"

    patient_data = {
        "full_name": request.form.get("full_name", "Unknown Patient") or "Unknown Patient",
        "age": int(request.form.get("age", 0) or 0),
        "gender": request.form.get("gender", "Not Specified"),
        "email": request.form.get("email", f"{uniq}@temp.com"),
        "city": request.form.get("city") or None,
        "doctor_name": request.form.get("doctor_name") or None,
    }

    # 3. ML Prediction
    from utils.preprocess import preprocess
    try:
        img_tensor = preprocess(img_path)
        res = model_predict(img_tensor)
        current_app.logger.info(f"Prediction: {res}")
    except Exception as e:
        current_app.logger.exception("ML failed")
        return jsonify({"error": "Prediction failed"}), 500

    label = res.get("label", "Unknown")
    prob_list = res.get("probabilities", [])
    probabilities = {name: float(prob_list[i]) if i < len(prob_list) else 0.0 
                    for i, name in enumerate(CLASS_NAMES)}
    confidence = max(probabilities.values())

    # 4. Grad-CAM
    heatmap_filename = f"{uniq}_heat.jpg"
    heatmap_path = os.path.join(current_app.config["UPLOAD_DIR"], heatmap_filename)
    try:
        make_gradcam(img_path, res.get("index", 0), heatmap_path)
    except Exception as e:
        current_app.logger.warning(f"Grad-CAM failed: {e}")
        heatmap_path = None
        heatmap_filename = None

    # 5. Generate Beautiful PDF Report
    report_filename = f"report_{uniq}.pdf"
    report_path_full = os.path.join(current_app.config["UPLOAD_DIR"], report_filename)

    try:
        # ←←← THIS IS THE EXACT LINE YOU ASKED FOR ←←←
        returned_path = generate_report(
            uniq=uniq,
            img_path=img_path,
            heat_path=heatmap_path,          # Can be None → report will skip image if missing
            label=label,
            probabilities=probabilities,
            patient_data=patient_data        # ← Sends name, age, doctor, etc.
        )
        report_filename = os.path.basename(returned_path) if returned_path else None
        current_app.logger.info(f"PDF Report generated: {report_filename}")
    except Exception as e:
        current_app.logger.warning(f"PDF generation failed: {e}")
        report_filename = None

    # 6. SAVE TO DB — ONLY VALID FIELDS
    try:
        patient = Patient(**patient_data)
        db.session.add(patient)
        db.session.flush()  # Check for errors early

        result = Result(
            patient_id=patient.id,
            prediction_label=label,
            confidence=confidence,
            probabilities=probabilities,
            mri_image_path=img_filename,
            heatmap_path=heatmap_filename,
            report_path=report_filename,
            predicted_at=datetime.utcnow()
        )
        db.session.add(result)
        db.session.commit()

        current_app.logger.info(f"SUCCESS: Patient {patient.id} saved with email {patient.email}")
        
    except sqlalchemy.exc.IntegrityError as e:
        db.session.rollback()
        error_msg = str(e.orig)
        if "UNIQUE constraint failed: patients.email" in error_msg:
            return jsonify({"error": f"Email already exists: {patient_data['email']}", "code": "EMAIL_EXISTS"}), 409
        elif "UNIQUE constraint failed: patients.patient_code" in error_msg:
            return jsonify({"error": f"Patient code already exists: {patient_data.get('patient_code')}", "code": "CODE_EXISTS"}), 409
        else:
            return jsonify({"error": "Database conflict (duplicate data)", "details": error_msg, "code": "DB_CONFLICT"}), 409

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": f"Invalid data: {str(e)}", "code": "VALIDATION_ERROR"}), 400

    except Exception as e:
        db.session.rollback()
        current_app.logger.exception("Unexpected DB error")
        return jsonify({
            "error": "Failed to save patient record",
            "details": str(e),
            "code": "SERVER_ERROR"
        }), 500

    # 7. Response
    base = request.host_url.rstrip("/")
    return jsonify({
        "message": "Prediction saved successfully!",
        "patient_id": patient.id,
        "patient_code": patient_code,
        "prediction": {
            "label": label,
            "confidence": round(confidence, 4),
            "probabilities": {k: round(v, 4) for k, v in probabilities.items()}
        },
        "urls": {
            "mri": f"{base}{url_for('predict.get_mri', filename=img_filename)}",
            "heatmap": f"{base}{url_for('predict.get_heat', filename=heatmap_filename)}" if heatmap_filename else None,
            "report": f"{base}{url_for('predict.get_report', filename=report_filename)}" if report_filename else None
        }
    }), 200


# File serving
@predict_bp.route("/mri/<filename>")
def get_mri(filename):
    path = os.path.join(current_app.config["UPLOAD_DIR"], filename)
    return send_file(path) if os.path.exists(path) else ("Not found", 404)

@predict_bp.route("/heat/<filename>")
def get_heat(filename):
    path = os.path.join(current_app.config["UPLOAD_DIR"], filename)
    return send_file(path) if os.path.exists(path) else ("Not found", 404)

@predict_bp.route("/report/<filename>")
def get_report(filename):
    path = os.path.join(current_app.config["UPLOAD_DIR"], filename)
    return send_file(path, mimetype="application/pdf") if os.path.exists(path) else ("Not found", 404)

@predict_bp.route("/", methods=["GET"])
def info():
    return jsonify({"status": "ready"})


    