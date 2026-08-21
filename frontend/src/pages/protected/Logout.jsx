import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/authContext';
import { clearAuthCache } from '../../helper/getAuthData';
import Loader from '../../components/loader';
import AxiosConfig from '../../configurations/axiosConfig';

const Logout = () => {
    const navigate = useNavigate();
    const { setIsAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        const doLogout = async () => {
            clearAuthCache();
            queryClient.clear();

            try {
                await AxiosConfig.post('auth/logout');
            } catch {
                // best-effort — clear cookies client-side as fallback
                document.cookie.split(';').forEach((c) => {
                    document.cookie = c.trim().split('=')[0] + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                });
            }

            setIsAuthenticated(false);

            const timer = setTimeout(() => {
                navigate('/login', { replace: true });
            }, 1000);

            return () => clearTimeout(timer);
        };

        doLogout();
    }, [navigate, setIsAuthenticated, queryClient]);

    return (
        <Loader message="Logging out..." />
    );
};

export default Logout;
