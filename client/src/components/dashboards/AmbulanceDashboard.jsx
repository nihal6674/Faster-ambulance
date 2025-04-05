import { useSelector } from "react-redux";
import AmbulanceInventory from "./AmbulanceInventory";

const AmbulanceDashboard = () => {
  const { isAuthenticated, details, role } = useSelector((state) => state.auth);

  
  return (
      <>
    
    <AmbulanceInventory/>
    </>
  );
};


export default AmbulanceDashboard;
