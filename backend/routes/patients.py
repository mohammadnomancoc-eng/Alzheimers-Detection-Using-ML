from flask import Blueprint, jsonify, request, url_for
from models import db
from models.patient import Patient
from models.result import Result

patients_bp = Blueprint("patients", __name__, url_prefix="/patients")

@patients_bp.route("/", methods=["GET", "OPTIONS"])
@patients_bp.route("", methods=["GET", "OPTIONS"])
def get_patients():
    if request.method == "OPTIONS":
        return "", 200

    patients = Patient.query.order_by(Patient.created_at.desc()).all()
    result_list = []
    
    base = request.host_url.rstrip("/")

    for p in patients:
        latest_res = Result.query.filter_by(patient_id=p.id).order_by(Result.predicted_at.desc()).first()
        
        severity_class = latest_res.prediction_label if latest_res else "Normal"
        confidence = latest_res.confidence if latest_res else 0.0
        date_str = latest_res.predicted_at.strftime("%Y-%m-%d") if (latest_res and latest_res.predicted_at) else (p.created_at.strftime("%Y-%m-%d") if p.created_at else "")
        
        report_url = f"{base}/predict/report/{latest_res.report_path}" if (latest_res and latest_res.report_path) else None
        mri_url = f"{base}/predict/mri/{latest_res.mri_image_path}" if (latest_res and latest_res.mri_image_path) else None
        heatmap_url = f"{base}/predict/heat/{latest_res.heatmap_path}" if (latest_res and latest_res.heatmap_path) else None

        result_list.append({
            "id": p.id,
            "patientCode": f"PT-{p.id:04d}",
            "name": p.full_name,
            "age": p.age,
            "gender": p.gender,
            "email": p.email,
            "doctorName": p.doctor_name,
            "severityClass": severity_class,
            "confidence": confidence,
            "date": date_str,
            "reportUrl": report_url,
            "mriUrl": mri_url,
            "heatmapUrl": heatmap_url,
        })

    return jsonify(result_list), 200
