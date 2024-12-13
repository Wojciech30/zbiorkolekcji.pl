<template>
  <div class="container mx-auto p-4">
    <header>
      <h1 class="text-4xl font-bold">Mój Profil</h1>
      <p class="text-gray-600">Zarządzaj swoimi danymi osobowymi i ustawieniami.</p>
    </header>

    <!-- Formularz edycji danych użytkownika -->
    <section class="mt-8">
      <h2 class="text-2xl font-semibold">Dane osobowe</h2>
      <form @submit.prevent="updateProfile">
        <div class="mt-4">
          <label for="firstName" class="block">Imię:</label>
          <input
              v-model="user.firstName"
              type="text"
              id="firstName"
              class="w-full p-2 border rounded"
          />
        </div>
        <div class="mt-4">
          <label for="lastName" class="block">Nazwisko:</label>
          <input
              v-model="user.lastName"
              type="text"
              id="lastName"
              class="w-full p-2 border rounded"
          />
        </div>
        <div class="mt-4">
          <label for="email" class="block">Adres e-mail:</label>
          <input
              v-model="user.email"
              type="email"
              id="email"
              class="w-full p-2 border rounded"
          />
        </div>
        <button
            type="submit"
            class="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Zapisz zmiany
        </button>
      </form>
    </section>

    <!-- Formularz zmiany hasła -->
    <section class="mt-8">
      <h2 class="text-2xl font-semibold">Zmień hasło</h2>
      <form @submit.prevent="changePassword">
        <div class="mt-4">
          <label for="currentPassword" class="block">Obecne hasło:</label>
          <input
              v-model="passwords.currentPassword"
              type="password"
              id="currentPassword"
              class="w-full p-2 border rounded"
              required
          />
        </div>
        <div class="mt-4">
          <label for="newPassword" class="block">Nowe hasło:</label>
          <input
              v-model="passwords.newPassword"
              type="password"
              id="newPassword"
              class="w-full p-2 border rounded"
              required
          />
        </div>
        <div class="mt-4">
          <label for="confirmPassword" class="block">Potwierdź nowe hasło:</label>
          <input
              v-model="passwords.confirmPassword"
              type="password"
              id="confirmPassword"
              class="w-full p-2 border rounded"
              required
          />
        </div>
        <button
            type="submit"
            class="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Zmień hasło
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import UserService from "@/services/UserService";

export default {
  name: "ProfileView",
  data() {
    return {
      user: {
        firstName: "",
        lastName: "",
        email: "",
      },
      passwords: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    };
  },
  async mounted() {
    try {
      const response = await UserService.getUserProfile();
      this.user = response.data;
    } catch (error) {
      console.error("Błąd pobierania danych użytkownika:", error);
    }
  },
  methods: {
    async updateProfile() {
      try {
        await UserService.updateUserProfile(this.user);
        alert("Profil został zaktualizowany.");
      } catch (error) {
        console.error("Błąd aktualizacji profilu:", error);
      }
    },
    async changePassword() {
      if (this.passwords.newPassword !== this.passwords.confirmPassword) {
        alert("Nowe hasła nie są zgodne.");
        return;
      }
      try {
        await UserService.changePassword(this.passwords);
        alert("Hasło zostało zmienione.");
        this.passwords = {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        };
      } catch (error) {
        console.error("Błąd zmiany hasła:", error);
      }
    },
  },
};
</script>

<style>
</style>