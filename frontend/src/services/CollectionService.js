import apiClient from './apiClient';

export default {
    getCollections() {
        return apiClient.get('/collections');
    },
    getCollection(id) {
        return apiClient.get(`/collections/${id}`);
    },
    addCollection(collection) {
        return apiClient.post('/collections', collection);
    },
    updateCollection(id, collection) {
        return apiClient.patch(`/collections/${id}`, collection);
    },
    deleteCollection(id) {
        return apiClient.delete(`/collections/${id}`);
    },
};
