<template>
  <div class="container mx-auto p-4">
    <header>
      <h1 class="text-4xl font-bold">Moje Kolekcje</h1>
      <p class="text-gray-600">Zarządzaj swoimi kolekcjami w jednym miejscu.</p>
    </header>

    <!-- Lista kolekcji -->
    <section class="mt-8">
      <h2 class="text-2xl font-semibold">Twoje Kolekcje</h2>
      <div v-if="isLoading" class="text-center">Ładowanie danych...</div>
      <div v-else-if="collections.length === 0" class="text-center">
        <p>Nie masz jeszcze żadnych kolekcji.</p>
        <button @click="showAddCollectionForm = true" class="text-blue-500 hover:underline">
          Dodaj nową kolekcję
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div
            v-for="collection in collections"
            :key="collection._id"
            class="p-4 border rounded shadow hover:shadow-lg transition"
        >
          <router-link :to="`/collection/${collection._id}`">
            <h3 class="text-lg font-bold">{{ collection.name }}</h3>
            <p class="text-sm text-gray-500">{{ collection.description }}</p>
          </router-link>
          <button
              @click="deleteCollection(collection._id)"
              class="mt-2 text-red-500 hover:underline"
          >
            Usuń
          </button>
          <button
              @click="editCollection(collection)"
              class="mt-2 text-blue-500 hover:underline"
          >
            Edytuj
          </button>
        </div>
      </div>
    </section>

    <!-- Formularz dodawania kolekcji -->
    <section v-if="showAddCollectionForm" class="mt-8">
      <h2 class="text-2xl font-semibold">Dodaj nową kolekcję</h2>
      <form @submit.prevent="addCollection">
        <div class="mt-4">
          <label for="name" class="block">Nazwa kolekcji:</label>
          <input
              v-model="newCollection.name"
              type="text"
              id="name"
              class="w-full p-2 border rounded"
              required
          />
        </div>
        <div class="mt-4">
          <label for="description" class="block">Opis kolekcji:</label>
          <textarea
              v-model="newCollection.description"
              id="description"
              class="w-full p-2 border rounded"
          ></textarea>
        </div>
        <div class="mt-4">
          <label for="category" class="block">Kategoria:</label>
          <select
              v-model="newCollection.categoryId"
              id="category"
              class="w-full p-2 border rounded"
              required
          >
            <option v-for="category in categories" :key="category._id" :value="category._id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <button
            type="submit"
            class="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Dodaj kolekcję
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import CollectionService from "@/services/CollectionService";
import CategoryService from "@/services/CategoryService";

export default {
  name: "MyCollectionsView",
  data() {
    return {
      collections: [],
      categories: [],
      isLoading: true,
      showAddCollectionForm: false,
      newCollection: {
        name: "",
        description: "",
        categoryId: "",
      },
    };
  },
  async mounted() {
    try {
      // Pobieranie kolekcji użytkownika
      const collectionsResponse = await CollectionService.getMyCollections();
      this.collections = collectionsResponse.data;

      // Pobieranie kategorii
      const categoriesResponse = await CategoryService.getCategories();
      this.categories = categoriesResponse.data;
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async addCollection() {
      try {
        const newCollectionResponse = await CollectionService.addCollection(this.newCollection);
        this.collections.push(newCollectionResponse.data);
        this.newCollection = { name: "", description: "", categoryId: "" };
        this.showAddCollectionForm = false;
      } catch (error) {
        console.error("Błąd dodawania kolekcji:", error);
      }
    },
    async deleteCollection(id) {
      try {
        await CollectionService.deleteCollection(id);
        this.collections = this.collections.filter(collection => collection._id !== id);
      } catch (error) {
        console.error("Błąd usuwania kolekcji:", error);
      }
    },
    editCollection(collection) {
      this.newCollection = { ...collection };
      this.showAddCollectionForm = true;
    },
  },
};
</script>

<style>
</style>
