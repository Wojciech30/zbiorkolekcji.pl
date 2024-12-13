import { createStore } from 'vuex';

export default createStore({
    state: {
        isLoggedIn: !!localStorage.getItem('token'), // Odczytaj token przy załadowaniu
        user: null,
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
            state.isLoggedIn = true;
        },
        logout(state) {
            state.user = null;
            state.isLoggedIn = false;
            localStorage.removeItem('token'); // Usuń token przy wylogowaniu
        },
    },
    actions: {
        login({ commit }, { user, token }) {
            localStorage.setItem('token', token); // Zapisz token w localStorage
            commit('setUser', user);
        },
        logout({ commit }) {
            commit('logout');
        },
    },
});
