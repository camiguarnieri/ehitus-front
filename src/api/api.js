import axios from "axios";

const ehitusApi = axios.create({
    baseURL: window.ehitusConfig.api_url,
});

ehitusApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

ehitusApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.hash = "#/login";
        }
        return Promise.reject(error);
    }
);

export { ehitusApi };