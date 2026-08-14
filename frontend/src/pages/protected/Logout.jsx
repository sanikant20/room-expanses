import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/loader';

const Logout = () => {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth();

    useEffect(() => {
        sessionStorage.clear();
        setIsAuthenticated(false);

        const timer = setTimeout(() => {
            navigate(`/login`, { replace: true });
        }, 1000);

        return () => clearTimeout(timer);
    }, [navigate, setIsAuthenticated]);

    return (
        <Loader message="Logging out..." />
    );
};

export default Logout;