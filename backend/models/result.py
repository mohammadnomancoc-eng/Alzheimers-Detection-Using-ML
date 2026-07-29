# models/result.py
from . import db
from datetime import datetime

class Result(db.Model):
    __tablename__ = "results"

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    prediction_label = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    probabilities = db.Column(db.JSON, nullable=False)
    mri_image_path = db.Column(db.String(255))
    heatmap_path = db.Column(db.String(255))
    report_path = db.Column(db.String(255))
    predicted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "prediction_label": self.prediction_label,
            "confidence": self.confidence,
            "probabilities": self.probabilities,
            "mri_image_path": self.mri_image_path,
            "heatmap_path": self.heatmap_path,
            "report_path": self.report_path,
            "predicted_at": self.predicted_at.isoformat() + "Z" if self.predicted_at else None
        }