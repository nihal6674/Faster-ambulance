from flask import Blueprint
from controllers.patient_controller import register_patient, login_patient, logout_patient

patient_bp = Blueprint("patient_bp", __name__)

patient_bp.route("/register", methods=["POST"])(register_patient)
patient_bp.route("/login", methods=["POST"])(login_patient)
patient_bp.route("/logout", methods=["POST"])(logout_patient)
