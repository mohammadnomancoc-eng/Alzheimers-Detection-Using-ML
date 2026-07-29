# models/patient.py
from . import db                    # ← THIS LINE IS CRITICAL
from datetime import datetime

class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    email = db.Column(db.String(120), unique=False, nullable=False)
    city = db.Column(db.String(100))
    doctor_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "age": self.age or 0,
            "gender": self.gender or "Not Specified",
            "email": self.email,
            "city": self.city,
            "doctor_name": self.doctor_name,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }