import { decryptData } from "../utils/encryption";

let _cachedRaw = undefined;
let _cachedResult = {};

export const getAuthData = () => {
    const encryptedAuthData = sessionStorage.getItem('user');
    if (encryptedAuthData === _cachedRaw) return _cachedResult;
    _cachedRaw = encryptedAuthData;
    try {
        const authData = decryptData(encryptedAuthData);
        const parsed = JSON.parse(authData || '{}');
        _cachedResult = {
            ...parsed,
            accountType: parsed?.accountType || 'user',
            FullName: parsed?.name || parsed?.email?.split('@')[0] || 'User',
            Email: parsed?.email || parsed?.Email || '',
            Phone: parsed?.phone || parsed?.Phone || '',
            ComID: parsed?.comId || parsed?.ComID || '',
        };
    } catch {
        _cachedResult = {};
    }
    return _cachedResult;
};

export const clearAuthCache = () => {
    _cachedRaw = undefined;
    _cachedResult = {};
};

export const isPartnerAccount = () => getAuthData()?.accountType === 'partner';
