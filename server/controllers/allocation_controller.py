from flask import request, jsonify
from models.ambulance_model import ambulance_collection
from models.hospital_model import hospital_collection
from models.request_model import requests_collection
import openrouteservice
from bson import ObjectId
from dotenv import load_dotenv
import os

load_dotenv()

ORS_API_KEY = os.getenv("ORS_API_KEY")
client = openrouteservice.Client(key=ORS_API_KEY)

def get_eta(coord1, coord2):
    try:
        routes = client.directions(
            coordinates=[coord1, coord2],
            profile='driving-car',
            format='geojson'
        )
        return routes['features'][0]['properties']['summary']['duration']  # duration in seconds
    except Exception as e:
        print("ORS Error:", e)
        return float("inf")


def allocate_ambulance_and_hospital():
    data = request.json
    patient_coords = [data["longitude"], data["latitude"]]
    patient_type = data["type"]

    # Step 1: Find nearest hospital
    hospitals = list(hospital_collection.find({}))
    nearest_hospital = None
    min_dist = float("inf")

    for hospital in hospitals:
        hospital_coords = [hospital["longitude"], hospital["latitude"]]
        dist = get_eta(patient_coords, hospital_coords)
        if dist < min_dist:
            min_dist = dist
            nearest_hospital = hospital

    if not nearest_hospital:
        return jsonify({"message": "No hospitals found"}), 404

    hospital_coords = [nearest_hospital["longitude"], nearest_hospital["latitude"]]

    # Step 2: Traverse ambulances and compute ETA logic
    ambulances = list(ambulance_collection.find({"availability": "free"}))
    selected_ambulance = None
    min_treatment_time = float("inf")

    for amb in ambulances:
        amb_type = amb["type"]
        amb_coords = [amb["longitude"], amb["latitude"]]

        to_patient = get_eta(amb_coords, patient_coords)
        to_hospital = get_eta(patient_coords, hospital_coords)

        if patient_type == "critical":
            if amb_type == "critical":
                treatment_time = to_patient
            else:
                treatment_time = to_patient + to_hospital
        else:  # non-critical patient
            if amb_type != "critical":
                treatment_time = to_patient
            else:
                continue  # skip critical ambulances for non-critical patients

        if treatment_time < min_treatment_time:
            min_treatment_time = treatment_time
            selected_ambulance = amb

    if not selected_ambulance:
        return jsonify({"message": "No suitable ambulance found"}), 404

    # Step 3: Save request to DB
    req_doc = {
        "patient_id": data["patient_id"],
        "hospital_id": str(nearest_hospital["hospital_id"]),
        "ambulance_id": str(selected_ambulance["ambulance_id"]),
        "in_transit": 1
    }
    requests_collection.insert_one(req_doc)

    return jsonify({
        "message": "Ambulance and hospital allocated",
        "ambulance_id": str(selected_ambulance["ambulance_id"]),
        "hospital_id": str(nearest_hospital["hospital_id"]),
        "eta": round(min_treatment_time / 60, 2)  # in minutes
    }), 200
