import apiClient from './apiClient';

export default {
    getCollections(params = {}) {
        return apiClient.get('/collections', {
            params: {
                page: 1,
                limit: 10,
                ...params
            }
        });
    },

    getCollection(id) {
        return apiClient.get(`/collections/${id}`);
    },

    createCollection(collectionData) {
        return apiClient.post('/collections', collectionData);
    },

    updateCollection(id, updates) {
        return apiClient.patch(`/collections/${id}`, updates);
    },

    deleteCollection(id) {
        return apiClient.delete(`/collections/${id}`);
    },

    getPopularCollections() {
        return apiClient.get('/collections/special/popular');
    },

    getUserCollections(userId) {
        return apiClient.get(`/users/${userId}/collections`);
    },

    searchCollections(query) {
        return apiClient.get('/collections/search', { params: { q: query } });
    },

    getCollectionStats(id) {
        return apiClient.get(`/collections/${id}/stats`);
    }
};