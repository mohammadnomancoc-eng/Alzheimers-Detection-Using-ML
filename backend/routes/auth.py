from flask import Blueprint, request, jsonify

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return "", 200
        
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()
    
    if email == "admin@login.com" and password == "admin123":
        return jsonify({
            "token": "alzheimers-admin-token-2026",
            "user": {
                "email": email,
                "role": "admin",
                "name": "Admin"
            }
        }), 200
    
    return jsonify({"message": "Invalid email or password"}), 401
