import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";

const HospitalDashboard = () => {
  const dispatch = useDispatch();
  const authData = useSelector((state) => state.auth);
  const currentHospitalId = authData?.details?.data?.hospital_id || "HOSP001";
  const [alerts, setAlerts] = useState([]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    window.location.href = "/login";
  };

  const requests = [
    { ambulanceId: "AMB001", patientId: "PAT123", flag: true, eta: "10 mins", hospitalId: "H003" },
    { ambulanceId: "AMB002", patientId: "PAT456", flag: false, eta: "Arrived", hospitalId: "H003" },
    { ambulanceId: "AMB003", patientId: "PAT789", flag: true, eta: "15 mins", hospitalId: "HOSP002" }
  ];

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/alerts/all?hospital_id=${currentHospitalId}`);
        setAlerts(res.data.reverse());
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      }
    };

    fetchAlerts();

    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, [currentHospitalId]);

  const filteredRequests = requests.filter(req => req.hospitalId === currentHospitalId);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🏥 Hospital Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Requests */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">🚑 Ambulance Requests</h2>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req, index) => (
              <div key={index} className="border-b p-3 flex justify-between">
                <div>
                  <p><strong>Ambulance ID:</strong> {req.ambulanceId}</p>
                  <p><strong>Patient ID:</strong> {req.patientId}</p>
                  <p><strong>ETA:</strong> {req.eta}</p>
                </div>
                <p className={`font-semibold ${req.flag ? "text-red-500" : "text-green-500"}`}>
                  {req.flag ? "In Transit" : "Arrived"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No ambulance requests.</p>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">⚠️ Alerts</h2>
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <div key={index} className="border-b p-3">
                <p><strong>Ambulance ID:</strong> {alert.ambulance_id}</p>
                <p><strong>Patient ID:</strong> {alert.patient_id}</p>
                <p><strong>Message:</strong> {alert.alert_message}</p>
                <p className={`font-semibold ${alert.alert_type === "Low Inventory" ? "text-orange-500" : "text-blue-500"}`}>
                  {alert.alert_type}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No alerts.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
