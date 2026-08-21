import axios from 'axios';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(({ resolve, reject }) => {
        error ? reject(error) : resolve();
    });
    failedQueue = [];
};

const baseURL = import.meta.env.VITE_BASE_URL || '/api';

const AxiosConfig = axios.create({
    baseURL,
    withCredentials: true,
});

const isRefreshRequest = (url) => /\/auth\/refresh$/.test(url || '');
const isAuthMeRequest = (url) => /\/auth\/me$/.test(url || '');

export const isLoginRequest = (url) => /\/login$|\/partner-login$/.test(url || '');

AxiosConfig.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest(originalRequest.url) && !isRefreshRequest(originalRequest.url)) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => AxiosConfig(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(`${baseURL}/auth/refresh`, null, { withCredentials: true });
                processQueue(null);
                return AxiosConfig(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                // A failing /me is the expected "not logged in" signal — let
                // checkAuth handle it. Other endpoints mean session expired.
                if (!isAuthMeRequest(originalRequest.url)) {
                    window.location.href = '/logout';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default AxiosConfig;
