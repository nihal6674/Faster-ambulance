from flask import request, jsonify
from models.patient_model import Patient

def register_patient():
    data = request.get_json()
    result = Patient.register_patient(data)
    return jsonify(result), (200 if "message" in result else 400)

def login_patient():
    data = request.get_json()
    result = Patient.authenticate_patient(
        data.get("email"),
        data.get("password")
    )
    return jsonify(result), (200 if "message" in result else 401)

def logout_patient():
    return jsonify({"success": True, "message": "Logged out successfully!"}), 200
