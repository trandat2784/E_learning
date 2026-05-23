import axios from 'axios';
import {runRedirectToLogin} from "./redirect";

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
    withCredentials: true,
});
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];
const handleLogout = () => {
    const publicPaths = ["/login", "/signup", "forgot-password"];
    const currentPath = window.location.pathname;
    if (!publicPaths.includes(currentPath)) {
        runRedirectToLogin()
    }
};
//handle adding a new access token to queued request
const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
};
//execute queued  request  after fresh
const onRefreshSuccess = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
};
//handle Api request
axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

//Handle expired token and refreesh logic
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const is401 = error?.response?.status === 401;
        const isRetry = originalRequest?._retry;
        const isAuthRequired = originalRequest?.requiresAuth == true;
        if (is401 && !isRetry && isAuthRequired) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
                })
            }
            originalRequest._retry = true;
            isRefreshing = true
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`,
                    {},
                    {withCredentials: true}
                );
                isRefreshing = false;
                onRefreshSuccess();
                return axiosInstance(originalRequest);
            } catch (error) {
                isRefreshing = false;
                refreshSubscribers = [];
                handleLogout();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);
export default axiosInstance;
