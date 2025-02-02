import { createStore } from "vuex";
import auth from "./modules/auth";
import categories from "./modules/categories";
import collections from "./modules/collections";

export default createStore({
    modules: {
        auth,
        categories,
        collections
    }
});