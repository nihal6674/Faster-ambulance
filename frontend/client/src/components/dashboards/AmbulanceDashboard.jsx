import { useDispatch, useSelector } from "react-redux";
import AmbulanceInventory from "./AmbulanceInventory";
import { logout } from "../../redux/authSlice";

const AmbulanceDashboard = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, details, role } = useSelector((state) => state.auth);

  // ✅ Logout handler
  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear(); // If you use redux-persist
    window.location.href = "/login"; // Redirect to login
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🚑 Ambulance Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <AmbulanceInventory />
    </div>
  );
};

export default AmbulanceDashboard;
