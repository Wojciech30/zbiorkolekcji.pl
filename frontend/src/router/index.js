import { createRouter, createWebHistory } from 'vue-router';

import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import MyCollectionsView from '@/views/MyCollectionsView.vue';

const routes = [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/moje-kolekcje', component: MyCollectionsView, meta: { requiresAuth: true }},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('token');

    if (to.meta.requiresAuth && !isLoggedIn) {
        return next('/login'); // Przekierowanie do logowania
    }

    next();
});


export default router;
