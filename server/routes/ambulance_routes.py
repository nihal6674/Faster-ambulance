from flask import Blueprint
from controllers.ambulance_controller import register_ambulance, login_ambulance, logout_ambulance

ambulance_bp = Blueprint("ambulance_bp", __name__)

# Register Ambulance
ambulance_bp.route("/register", methods=["POST"])(register_ambulance)

# Ambulance Login
ambulance_bp.route("/login", methods=["POST"])(login_ambulance)

# Logout
ambulance_bp.route("/logout", methods=["POST"])(logout_ambulance)
