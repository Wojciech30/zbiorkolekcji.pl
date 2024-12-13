<template>
  <div class="container mx-auto p-4">
    <header class="text-center">
      <h1 class="text-4xl font-bold">Witaj w Zbiór Kolekcji</h1>
      <p class="text-gray-600">Twórz, zarządzaj i dziel się swoimi kolekcjami.</p>
      <div class="mt-4">
        <router-link to="/register" class="text-blue-500 hover:underline">Zarejestruj się</router-link>
        <span class="mx-2">|</span>
        <router-link to="/login" class="text-blue-500 hover:underline">Zaloguj się</router-link>
      </div>
    </header>

    <!-- Wyszukiwarka -->
    <section class="mt-8">
      <h2 class="text-2xl font-semibold">Wyszukiwarka</h2>
      <div class="mt-4 flex gap-4">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="Wyszukaj kategorię..."
            class="flex-1 p-2 border rounded"
        />
        <button @click="search" class="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Szukaj
        </button>
      </div>
    </section>

    <!-- Kategorie -->
    <section class="mt-8">
      <h2 class="text-2xl font-semibold">Kategorie</h2>
      <div v-if="isLoading" class="text-center">Ładowanie danych...</div>
      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div
            v-for="category in filteredCategories"
            :key="category._id"
            class="p-4 border rounded shadow hover:shadow-lg transition"
        >
          <router-link :to="`/category/${category._id}`">
            <h3 class="text-lg font-bold">{{ category.name }}</h3>
            <p class="text-sm text-gray-500">{{ category.description }}</p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Najpopularniejsze kolekcje -->
    <section class="mt-8">
      <h2 class="text-2xl font-semibold">Najpopularniejsze Kolekcje</h2>
      <div v-if="isLoading" class="text-center">Ładowanie danych...</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div
            v-for="collection in popularCollections"
            :key="collection._id"
            class="p-4 border rounded shadow hover:shadow-lg transition"
        >
          <router-link :to="`/collection/${collection._id}`">
            <h3 class="text-lg font-bold">{{ collection.name }}</h3>
            <p class="text-sm text-gray-500">{{ collection.description }}</p>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import CategoryService from "@/services/CategoryService";
import CollectionService from "@/services/CollectionService";

export default {
  name: "HomeView",
  data() {
    return {
      categories: [],
      popularCollections: [],
      searchQuery: "",
      isLoading: true,
    };
  },
  computed: {
    filteredCategories() {
      return this.categories.filter(category =>
          category.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  async mounted() {
    try {
      const categoryResponse = await CategoryService.getCategories();
      this.categories = categoryResponse.data;

      const collectionResponse = await CollectionService.getPopularCollections();
      this.popularCollections = collectionResponse.data;
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    search() {
      console.log("Szukam:", this.searchQuery);
    },
  },
};
</script>

<style>
/* Dostosowane style, jeśli są potrzebne */
</style>
