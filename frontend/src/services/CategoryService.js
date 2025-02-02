import apiClient from './apiClient';

export default {
    getCategories(params = {}) {
        return apiClient.get('/categories', { params });
    },

    getCategory(id) {
        return apiClient.get(`/categories/${id}`);
    },

    createCategory(categoryData) {
        return apiClient.post('/categories', categoryData);
    },

    updateCategory(id, updates) {
        return apiClient.patch(`/categories/${id}`, updates);
    },

    deleteCategory(id) {
        return apiClient.delete(`/categories/${id}`);
    },

    getCategoryCollections(id) {
        return apiClient.get(`/categories/${id}/collections`);
    }
};