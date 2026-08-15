import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

export const encryptData = (Data) => {
    try {
        const encrypted = CryptoJS.AES.encrypt(Data?.toString(), SECRET_KEY).toString();
        return encodeURIComponent(encrypted);
    } catch (error) {
        console.error('Encryption error:', error);
        return Data;
    }
};

export const decryptData = (encryptedData) => {
    try {
        const decoded = decodeURIComponent(encryptedData);
        if (/^[{[]/.test(decoded.trim())) {
            return decoded;
        }
        const bytes = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || null;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};
