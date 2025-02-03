import CollectionService from "@/services/CollectionService";
import {handleApiError} from "@/utils/errorHandler";

export default {
    namespaced: true,
    state: () => ({
        userCollections: [],
        publicCollections: []
    }),
    mutations: {
        ADD_COLLECTION(state, collection) {
            state.userCollections.push(collection);
        },
        UPDATE_COLLECTION(state, updatedCollection) {
            const index = state.userCollections.findIndex(c => c._id === updatedCollection._id);
            if (index !== -1) {
                state.userCollections.splice(index, 1, updatedCollection);
            }
        }
    },
    actions: {
        async addCollection({ commit }, collectionData) {
            try {
                const response = await CollectionService.addCollection(collectionData);
                commit('ADD_COLLECTION', response.data.collection);
                return response;
            } catch (error) {
                handleApiError(error);
                throw error;
            }
        },
        async updateCollection({ commit }, { id, data }) {
            try {
                const response = await CollectionService.updateCollection(id, data);
                commit('UPDATE_COLLECTION', response.data.collection);
                return response;
            } catch (error) {
                handleApiError(error);
                throw error;
            }
        }
    }
};