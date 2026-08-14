import { decryptData } from "../utils/encryption";

export const getAuthData = () => {
    const encryptedAuthData = sessionStorage.getItem('user');
    try {
        const authData = decryptData(encryptedAuthData);
        const parsed = JSON.parse(authData || '{}');
        return {
            ...parsed,
            FullName: parsed?.name || parsed?.email?.split('@')[0] || 'User',
        };
    } catch {
        return {};
    }
};
