import { useContext } from 'react';
import { AuthExpirationContext } from './authExpirationContext';

export const useAuthExpiration = () => {
    const context = useContext(AuthExpirationContext);
    if (!context) {
        throw new Error('useAuthExpiration must be used within AuthExpirationProvider');
    }
    return context;
};
