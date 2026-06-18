import axios from "axios";

const getToken = () => localStorage.getItem("token") || "";

const ehitusApi = axios.create({
    baseURL: window.ehitusConfig.api_url,
});

ehitusApi.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { ehitusApi };