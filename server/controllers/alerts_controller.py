from flask import request, jsonify, current_app
from models.alerts_model import alerts_collection
from bson import ObjectId

def create_alert():
    data = request.json

    alert = {
        "ambulance_id": data["ambulance_id"],
        "patient_id": data["patient_id"],
        "hospital_id": data["hospital_id"],
        "alert_type": data["alert_type"],
        "alert_message": data["alert_message"],
        "flag": data["flag"]
    }

    # Insert into MongoDB and get inserted ID
    inserted = alerts_collection.insert_one(alert)
    alert["_id"] = str(inserted.inserted_id)  # Convert ObjectId to string

    # Emit the alert to all connected clients
    socketio = current_app.socketio
    socketio.emit("receive_alert", alert)

    return jsonify({"message": "Alert created and emitted"}), 201


def get_alerts():
    """Get alerts filtered by hospital_id (if provided)"""
    hospital_id = request.args.get("hospital_id")

    query = {}
    if hospital_id:
        query["hospital_id"] = hospital_id

    alerts = list(alerts_collection.find(query))
    for alert in alerts:
        alert["_id"] = str(alert["_id"])  # Convert ObjectId to string

    return jsonify(alerts), 200
