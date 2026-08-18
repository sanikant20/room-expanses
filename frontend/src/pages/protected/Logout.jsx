import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/useAuth';
import { clearAuthCache } from '../../helper/getAuthData';
import Loader from '../../components/loader';

const Logout = () => {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        clearAuthCache();
        sessionStorage.clear();
        queryClient.clear();
        setIsAuthenticated(false);

        const timer = setTimeout(() => {
            navigate(`/login`, { replace: true });
        }, 1000);

        return () => clearTimeout(timer);
    }, [navigate, setIsAuthenticated, queryClient]);

    return (
        <Loader message="Logging out..." />
    );
};

export default Logout;