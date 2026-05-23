import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
    withCredentials: true,
});
console.log("Axios instance", `${process.env.NEXT_PUBLIC_SERVER_URI}/api/refresh-token`);
let isRefreshing = false;
let refreshSubcribers: (() => void)[] = [];
const handleLogout = () => {
    if (window.location.pathname != 'login') {
        window.location.href = '/login';
    }
};
//handle adding a new access token to queued request
const subcribeTokenRefresh = (callback: () => void) => {
    refreshSubcribers.push(callback);
};
//execute queued  request  after fresh
const onRefreshSuccess = () => {
    refreshSubcribers.forEach((callback) => callback());
    refreshSubcribers = [];
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
        if (error.response?.status == 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subcribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
                });
            }
            originalRequest._retry = true;
            isRefreshing = true;
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
                refreshSubcribers = [];
                handleLogout();
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;
