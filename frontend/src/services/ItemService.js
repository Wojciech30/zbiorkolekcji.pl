import apiClient from './apiClient';

export default {
    getItems() {
        return apiClient.get('/items');
    },
    addItem(item) {
        return apiClient.post('/items', item);
    },
};
