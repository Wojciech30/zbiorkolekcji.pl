import apiClient from "@/services/apiClient";

export default {
    async login(credentials) {
        return apiClient.post("auth/login", credentials);
    },
    async register(userData) {
        return apiClient.post("/auth/register", userData);
    },
    async getProfile() {
        return apiClient.get("/auth/profile");
    },
};
