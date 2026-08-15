import React, { useEffect, useState } from 'react';
import { AuthContext } from './authContext';

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);
    
    useEffect(() => {
        // Initial check
        const authStatus = !!sessionStorage.getItem('auth');
        setIsAuthenticated(authStatus);

        const handleStorageChange = () => {
            const newAuthStatus = !!sessionStorage.getItem('auth');
            setIsAuthenticated(newAuthStatus);
        };

        window.addEventListener('storage', handleStorageChange);

        // Also listen for storage changes in the same tab
        const originalSetItem = sessionStorage.setItem;
        const originalRemoveItem = sessionStorage.removeItem;

        sessionStorage.setItem = function (key) {
            originalSetItem.apply(this, arguments);
            if (key === 'auth') {
                handleStorageChange();
            }
        };

        sessionStorage.removeItem = function (key) {
            originalRemoveItem.apply(this, arguments);
            if (key === 'auth') {
                handleStorageChange();
            }
        };

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            sessionStorage.setItem = originalSetItem;
            sessionStorage.removeItem = originalRemoveItem;
        };
    }, []);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            setIsAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
};