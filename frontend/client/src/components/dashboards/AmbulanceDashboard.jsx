import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import AmbulanceInventory from "./AmbulanceInventory";
import { logout } from "../../redux/authSlice";

const AmbulanceDashboard = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, details, role } = useSelector((state) => state.auth);
  const ambulanceId = details?.data?.ambulance_id;

  const [assignment, setAssignment] = useState(null);

  // ✅ Logout handler
  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear(); // If you use redux-persist
    window.location.href = "/login"; // Redirect to login
  };

  // ✅ Fetch assigned request data
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/requests/ambulance?ambulance_id=${ambulanceId}`);
        if (res.data.status === "busy") {
          setAssignment(res.data.data);
        } else {
          setAssignment(null);
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      }
    };

    fetchAssignment();
    const interval = setInterval(fetchAssignment, 5000);
    return () => clearInterval(interval);
  }, [ambulanceId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🚑 Ambulance Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Assignment Info */}
      <div className="mt-6 bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">🚨 Current Assignment</h2>
        {assignment ? (
          <div>
            <p><strong>Patient:</strong> {assignment?.patient?.name || "N/A"} ({assignment.patient_id})</p>
            <p><strong>Hospital:</strong> {assignment?.hospital?.name || "N/A"} ({assignment.hospital_id})</p>
            <p><strong>In Transit:</strong> {assignment.in_transit ? "Yes" : "No"}</p>
          </div>
        ) : (
          <p className="text-green-600 font-medium">✅ Ambulance is free.</p>
        )}
      </div>

      {/* Inventory */}
      <AmbulanceInventory />

    </div>
  );
};

export default AmbulanceDashboard;
