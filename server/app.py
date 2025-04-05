from flask import Flask
from flask_cors import CORS
from config import db

# Import route Blueprints
from routes.ambulance_routes import ambulance_bp
from routes.inventory_routes import inventory_bp
from routes.patient_routes import patient_bp
from routes.hospital_routes import hospital_bp
from routes.allocation_routes import allocation_bp
from routes.alerts_routes import alerts_bp

from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enables CORS for all routes

# Register Blueprints
app.register_blueprint(ambulance_bp, url_prefix="/api/ambulance")
app.register_blueprint(inventory_bp, url_prefix="/api/inventory")
app.register_blueprint(patient_bp, url_prefix="/api/patient")
app.register_blueprint(hospital_bp, url_prefix="/api/hospital")
app.register_blueprint(allocation_bp, url_prefix="/api")
app.register_blueprint(alerts_bp, url_prefix="/alerts")

# MongoDB Connection Check
try:
    db.list_collection_names()
    print("✅ MongoDB Connected Successfully!")
except Exception as e:
    print(f"❌ MongoDB Connection Failed: {e}")

@app.route('/')
def home():
    return "🚑 FastER Ambulance Management System is Running!"

if __name__ == "__main__":
    app.run(debug=True)
