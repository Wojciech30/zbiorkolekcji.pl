<template>
  <div class="container mx-auto p-4">
    <header>
      <h1 class="text-4xl font-bold text-center">Logowanie</h1>
      <p class="text-center text-gray-600">Wprowadź swoje dane, aby się zalogować.</p>
    </header>

    <!-- Formularz logowania -->
    <section class="mt-8 max-w-md mx-auto">
      <form @submit.prevent="login">
        <div class="mt-4">
          <label for="username" class="block">Nazwa użytkownika:</label>
          <input
              v-model="credentials.username"
              type="text"
              id="username"
              class="w-full p-2 border rounded"
              required
          />
        </div>
        <div class="mt-4 relative">
          <label for="password" class="block">Hasło:</label>
          <input
              v-model="credentials.password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              class="w-full p-2 border rounded"
              required
          />
          <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute right-2 top-9 text-gray-600 hover:text-gray-800"
          >
            <span v-if="showPassword">Ukryj</span>
            <span v-else>Pokaż</span>
          </button>
        </div>
        <button
            type="submit"
            class="mt-6 w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Zaloguj się
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import AuthService from "@/services/AuthService";

export default {
  name: "LoginView",
  data() {
    return {
      credentials: {
        username: "",
        password: "",
      },
      showPassword: false,
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async login() {
      try {
        const response = await AuthService.login(this.credentials);
        localStorage.setItem("token", response.data.token);
        this.$router.push("/"); // Przekierowanie na stronę główną
      } catch (error) {
        console.error("Błąd logowania:", error);
        alert("Nieprawidłowa nazwa użytkownika lub hasło.");
      }
    },
  },
};
</script>

<style>
</style>
