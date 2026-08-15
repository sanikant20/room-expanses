import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export const PublicRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // Redirect authenticated users to dashboard (or wherever they came from)
    const redirectTo = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};