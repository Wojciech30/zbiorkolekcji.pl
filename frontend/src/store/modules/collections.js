import CollectionService from "@/services/CollectionService";
import {handleApiError} from "@/utils/errorHandler";

export default {
    namespaced: true,
    state: () => ({
        userCollections: [],
        publicCollections: []
    }),
    mutations: {
        SET_USER_COLLECTIONS(state, collections) {
            state.userCollections = collections;
        },
        SET_COLLECTION_STATS(state, { itemsCount, views }) {
            state.currentCollection = {
                ...state.currentCollection,
                itemsCount,
                views
            };
        }
    },
    actions: {
        async loadUserCollections({ commit, rootState }) {
            try {
                const response = await CollectionService.getUserCollections(rootState.auth.user._id);
                commit("SET_USER_COLLECTIONS", response.data);
            } catch (error) {
                console.error('Error loading collections:', error.response?.data?.message || error.message);
                throw error;
            }
        },
        async fetchCollectionDetails({ commit }, id) {
            try {
                const response = await CollectionService.getCollectionDetails(id);
                commit('SET_CURRENT_COLLECTION', response.data);

                const stats = await CollectionService.getCollectionStats(id);
                commit('SET_COLLECTION_STATS', stats.data);
            } catch (error) {
                handleApiError(error);
            }
        }
    }
};