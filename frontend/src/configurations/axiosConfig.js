import axios from 'axios';

let authExpirationHandler = null;

export const setAuthExpirationHandler = (handler) => {
    authExpirationHandler = handler;
};

const baseURL = import.meta.env.VITE_BASE_URL || '/api';

const AxiosConfig = axios.create({
    baseURL,
});

AxiosConfig.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('auth');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const isLoginRequest = (url) => /\/login$|\/partner-login$/.test(url || '');

AxiosConfig.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !isLoginRequest(error.config?.url)) {
            if (authExpirationHandler) {
                authExpirationHandler();
            } else {
                window.location.href = '/logout';
            }
        }
        return Promise.reject(error);
    }
);

export default AxiosConfig;
