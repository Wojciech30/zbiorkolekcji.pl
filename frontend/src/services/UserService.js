import apiClient from './apiClient';

export default {
    register(user) {
        return apiClient.post('/users/register', user);
    },
    login(credentials) {
        return apiClient.post('/users/login', credentials);
    },
    getProfile() {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Brak tokena uwierzytelniającego');
        return apiClient.get('/users/me', {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};

