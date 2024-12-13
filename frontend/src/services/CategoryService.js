import apiClient from "./apiClient";

export default {
    async getCategories() {
        return apiClient.get("/categories");
    },
};
