import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Redirect to home/login, saving the attempted path for post-login redirect
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};