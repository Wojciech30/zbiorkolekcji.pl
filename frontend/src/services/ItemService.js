import apiClient from './apiClient';

export default {

    getItem(id) {
        return apiClient.get(`/items/${id}`);
    },

    createItem(itemData) {
        return apiClient.post('/items', itemData);
    },

    updateItem(id, updates) {
        return apiClient.patch(`/items/${id}`, updates);
    },

    deleteItem(id) {
        return apiClient.delete(`/items/${id}`);
    },

    getItemsByCollection(collectionId) {
        return apiClient.get(`/collections/${collectionId}/items`);
    },

    searchItems(query) {
        return apiClient.get('/items/search', { params: { q: query } });
    },

    validateItemAttributes(collectionId, attributes) {
        return apiClient.post(`/collections/${collectionId}/validate`, attributes);
    }
};