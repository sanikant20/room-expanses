import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

export const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    // undefined = /auth/me check still in flight — render nothing yet
    if (isAuthenticated === undefined) return null;
    if (!isAuthenticated) {
        // Redirect to home/login, saving the attempted path for post-login redirect
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};
