import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://172.23.52.141:3000", // Adres backendu dostosowany do WSL
    headers: {
        "Content-Type": "application/json",
    },
});

// Dodawanie tokena JWT do każdego żądania, jeśli jest dostępny
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;