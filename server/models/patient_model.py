from config import db
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

patient_collection = db["patients"]

class Patient:
    @staticmethod
    def register_patient(data):
        required_fields = ["name", "email", "password", "address", "blood_group", "gender"]
        if not all(field in data for field in required_fields):
            return {"error": "Missing required fields"}

        if patient_collection.find_one({"email": data["email"]}):
            return {"error": "Email already registered"}

        data["password"] = generate_password_hash(data["password"])
        patient_collection.insert_one(data)

        return {"message": "Patient registered successfully"}

    @staticmethod
    def authenticate_patient(email, password):
        patient = patient_collection.find_one({"email": email})
        if patient and check_password_hash(patient["password"], password):
            # Return only necessary info
            return {
                "message": "Login successful",
                "data": {
                    "id": str(patient["_id"]),
                    "name": patient["name"],
                    "email": patient["email"],
                    "role": "patient",
                    "latitude":patient["latitude"],
                    "longitude":patient["longitude"],
                }
            }
        return {"error": "Invalid email or password"}
