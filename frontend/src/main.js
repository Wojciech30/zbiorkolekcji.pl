import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store'; // Import Vuex
import './assets/tailwind.css'; // Tailwind CSS

createApp(App)
    .use(router)
    .use(store) // Dodanie Vuex do aplikacji
    .mount('#app');


