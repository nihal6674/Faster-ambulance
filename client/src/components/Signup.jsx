import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const signupEndpoints = {
  ambulance: "http://localhost:5000/api/ambulance/register",
  patient: "http://localhost:5000/api/patient/register",
  hospital: "http://localhost:5000/api/hospital/register",
};

export default function SignupPage() {
  const [role, setRole] = useState("ambulance");
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          alert("Error getting location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(signupEndpoints[role], formData);
      alert(res.data.message || "Signup successful!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div>
      <h2>Signup Page</h2>
      <label>Role: </label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="ambulance">Ambulance</option>
        <option value="patient">Patient</option>
        <option value="hospital">Hospital</option>
      </select>

      <form onSubmit={signupHandler}>
        {role !== "hospital" && (
          <input name="name" placeholder="Name" onChange={handleChange} required />
        )}
        {role === "hospital" && (
          <input name="name" placeholder="Hospital Name" onChange={handleChange} required />
        )}
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

        {role === "ambulance" && (
          <>
            <input name="driver_name" placeholder="Driver Name" onChange={handleChange} required />
            <input name="number_plate" placeholder="Number Plate" onChange={handleChange} required />
            <input name="type" placeholder="Ambulance Type" onChange={handleChange} required />
          </>
        )}

        {role === "patient" && (
          <>
            <input name="address" placeholder="Address" onChange={handleChange} required />
            <input name="blood_group" placeholder="Blood Group" onChange={handleChange} required />
            <input name="gender" placeholder="Gender" onChange={handleChange} required />
          </>
        )}

        {role === "hospital" && (
          <input name="location" placeholder="Location" onChange={handleChange} required />
        )}

        {/* Location fields for all roles */}
        <div>
          <button type="button" onClick={getLocation}>
            Get My Location
          </button>
          <input 
            name="latitude" 
            placeholder="Latitude" 
            value={formData.latitude || ""} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="longitude" 
            placeholder="Longitude" 
            value={formData.longitude || ""} 
            onChange={handleChange} 
            required 
          />
        </div>

        <button type="submit">Signup</button>
      </form>
    </div>
  );
}