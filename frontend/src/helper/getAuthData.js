import { decryptData } from "../utils/encryption";

export const getAuthData = () => {
    const encryptedAuthData = sessionStorage.getItem('user');
    try {
        const authData = decryptData(encryptedAuthData);
        const parsed = JSON.parse(authData || '{}');
        return {
            ...parsed,
            accountType: parsed?.accountType || 'user',
            FullName: parsed?.name || parsed?.email?.split('@')[0] || 'User',
            Email: parsed?.email || parsed?.Email || '',
            Phone: parsed?.phone || parsed?.Phone || '',
            ComID: parsed?.comId || parsed?.ComID || '',
        };
    } catch {
        return {};
    }
};

export const isPartnerAccount = () => getAuthData()?.accountType === 'partner';
