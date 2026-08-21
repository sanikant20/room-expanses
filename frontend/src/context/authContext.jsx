import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AxiosConfig from '../configurations/axiosConfig';
import { setAuthData, getAuthData, clearAuthCache } from '../helper/getAuthData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticatedState] = useState(undefined);
    const [user, setUser] = useState(() => getAuthData());

    // Auth state is determined by the server (session cookies), never by
    // reading document.cookie — so httpOnly tokens work on every refresh.
    const checkAuth = useCallback(async () => {
        try {
            const response = await AxiosConfig.get('/auth/me');
            if (response?.data?.success === true && response?.data?.user) {
                setAuthData(response.data.user);
                setUser(getAuthData());
                return true;
            }
            clearAuthCache();
            setUser({});
            return false;
        } catch {
            clearAuthCache();
            setUser({});
            return false;
        }
    }, []);

    const setIsAuthenticated = useCallback(async (value) => {
        if (value === true) {
            const authenticated = await checkAuth();
            setIsAuthenticatedState(authenticated);
        } else {
            clearAuthCache();
            setUser({});
            setIsAuthenticatedState(false);
        }
    }, [checkAuth]);

    // Update cached user data directly (e.g. after a profile edit) without
    // an extra /me round-trip.
    const setUserFromResponse = useCallback((freshUser) => {
        if (!freshUser) return;
        setAuthData(freshUser);
        setUser(getAuthData());
    }, []);

    useEffect(() => {
        checkAuth().then(setIsAuthenticatedState);
    }, [checkAuth]);

    const value = useMemo(
        () => ({ isAuthenticated, setIsAuthenticated, user, setUser: setUserFromResponse }),
        [isAuthenticated, setIsAuthenticated, user, setUserFromResponse]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const useAuthData = () => {
    const { user } = useAuth();
    return user;
};

export const useIsPartner = () => {
    const { user } = useAuth();
    return user?.accountType === 'partner';
};
