import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const loginEndpoints = {
  ambulance: "http://localhost:5000/api/ambulance/login",
  patient: "http://localhost:5000/api/patient/login",
  hospital: "http://localhost:5000/api/hospital/login",
};

export default function LoginPage() {
  const [role, setRole] = useState("ambulance");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(loginEndpoints[role], { email, password });
      console.log(res.data);
      dispatch(loginSuccess({ role, details : res.data }));
      alert(res.data.message || "Login successful!");
      navigate(`/${role}/dashboard`);
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login Page</h2>
      <label>User Role: </label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="ambulance">Ambulance</option>
        <option value="patient">Patient</option>
        <option value="hospital">Hospital</option>
      </select>

      <form onSubmit={loginHandler}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
