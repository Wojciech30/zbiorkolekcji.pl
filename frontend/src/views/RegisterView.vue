<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-6">Rejestracja</h1>
    <form @submit.prevent="registerUser" class="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md space-y-4">
      <div>
        <label for="username" class="block font-bold">Nazwa użytkownika</label>
        <input v-model="user.username" id="username" type="text" class="border w-full p-2 rounded" />
      </div>
      <div>
        <label for="email" class="block font-bold">Email</label>
        <input v-model="user.email" id="email" type="email" class="border w-full p-2 rounded" />
      </div>
      <div>
        <label for="password" class="block font-bold">Hasło</label>
        <input v-model="user.password" id="password" type="password" class="border w-full p-2 rounded" />
      </div>
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded w-full">Zarejestruj się</button>
    </form>
  </div>
</template>

<script>
import UserService from '../services/UserService';

export default {
  data() {
    return {
      user: {
        username: '',
        email: '',
        password: '',
      },
    };
  },
  methods: {
    async registerUser() {
      try {
        await UserService.register(this.user);
        alert('Rejestracja zakończona sukcesem!');
        this.$router.push('/login');
      } catch (error) {
        console.error('Błąd rejestracji:', error);
        alert('Rejestracja nie powiodła się.');
      }
    },
  },
};
</script>
