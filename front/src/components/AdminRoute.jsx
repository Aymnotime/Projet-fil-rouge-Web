import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Pas connecté
    return <Navigate to="/login" />;
  }

  if (user.fonction !== "admin") {
    // Connecté mais pas admin
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;