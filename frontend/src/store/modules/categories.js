import CategoryService from "@/services/CategoryService";

export default {
    namespaced: true,
    state: () => ({
        categories: [],
        selectedCategory: null
    }),
    mutations: {
        SET_CATEGORIES(state, categories) {
            state.categories = categories;
        }
    },
    actions: {
        async loadCategories({ commit }) {
            const categories = await CategoryService.getCategories();
            commit("SET_CATEGORIES", categories);
        }
    }
};