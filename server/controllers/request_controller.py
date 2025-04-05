from flask import request, jsonify
from models.request_model import requests_collection
from models.ambulance_model import ambulance_collection
from models.patient_model import patient_collection
from bson import ObjectId

def get_requests_by_hospital(hospital_id):
    requests = list(requests_collection.find({"hospital_id": hospital_id}))
    for req in requests:
        req["_id"] = str(req["_id"])
    return jsonify(requests), 200

def get_request_by_ambulance():
    ambulance_id = request.args.get("ambulance_id")
    if not ambulance_id:
        return jsonify({"message": "Ambulance ID is required"}), 400

    request_doc = requests_collection.find_one({"ambulance_id": ambulance_id})
    if not request_doc:
        return jsonify({"status": "free", "message": "No active request"}), 200

    request_doc["_id"] = str(request_doc["_id"])
    return jsonify({"status": "busy", "data": request_doc}), 200

def mark_request_received():
    data = request.json
    request_id = data.get("request_id")
    ambulance_id = data.get("ambulance_id")
    patient_id = data.get("patient_id")

    if not all([request_id, ambulance_id, patient_id]):
        return jsonify({"message": "Missing required fields"}), 400

    # Set ambulance free
    ambulance_collection.update_one({"ambulance_id": ambulance_id}, {"$set": {"availability": "free"}})

    # Set patient in_transit to 0
    patient_collection.update_one({"patient_id": patient_id}, {"$set": {"in_transit": 0}})

    # Delete request
    requests_collection.delete_one({"_id": ObjectId(request_id)})

    return jsonify({"message": "Request marked as received"}), 200
