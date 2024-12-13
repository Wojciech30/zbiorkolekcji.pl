<template>
  <div class="container mx-auto p-4">
    <header>
      <h1 class="text-4xl font-bold">{{ category.name }}</h1>
      <p class="text-gray-600">{{ category.description }}</p>
    </header>

    <section class="mt-8">
      <h2 class="text-2xl font-semibold">Kolekcje w tej kategorii</h2>
      <div v-if="isLoading" class="text-center">Ładowanie danych...</div>
      <div v-else-if="collections.length === 0" class="text-center">
        <p>Brak kolekcji w tej kategorii.</p>
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
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import CategoryService from "@/services/CategoryService";
import CollectionService from "@/services/CollectionService";

export default {
  name: "CategoryView",
  data() {
    return {
      category: {},
      collections: [],
      isLoading: true,
    };
  },
  async mounted() {
    try {
      const categoryId = this.$route.params.id;

      // Pobieranie danych kategorii
      const categoryResponse = await CategoryService.getCategory(categoryId);
      this.category = categoryResponse.data;

      // Pobieranie kolekcji przypisanych do tej kategorii
      const collectionsResponse = await CollectionService.getCollectionsByCategory(categoryId);
      this.collections = collectionsResponse.data;
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    } finally {
      this.isLoading = false;
    }  },
};
</script>

<style>
/* Dostosowane style */
</style>
