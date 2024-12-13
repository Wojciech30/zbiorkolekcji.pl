<template>
  <div class="container mx-auto p-4">
    <header>
      <h1 class="text-4xl font-bold">{{ collection.name }}</h1>
      <p class="text-gray-600">{{ collection.description }}</p>
      <p class="text-sm text-gray-500">
        Kategoria:
        <router-link
            :to="`/category/${collection.categoryId?._id}`"
            class="text-blue-500 hover:underline"
        >
          {{ collection.categoryId?.name || 'Nieznana kategoria' }}
        </router-link>
      </p>
    </header>

    <!-- Lista przedmiotów -->
    <section class="mt-8">
      <h2 class="text-2xl font-semibold">Przedmioty w tej kolekcji</h2>
      <div v-if="isLoading" class="text-center">Ładowanie danych...</div>
      <div v-else-if="items.length === 0" class="text-center">
        <p>Brak przedmiotów w tej kolekcji.</p>
        <button
            @click="showAddItemForm = true"
            class="text-blue-500 hover:underline"
        >
          Dodaj przedmiot
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div
            v-for="item in items"
            :key="item._id"
            class="p-4 border rounded shadow hover:shadow-lg transition"
        >
          <router-link :to="`/item/${item._id}`">
            <h3 class="text-lg font-bold">{{ item.name }}</h3>
            <p class="text-sm text-gray-500">{{ item.description }}</p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Formularz dodawania przedmiotu -->
    <section v-if="showAddItemForm" class="mt-8">
      <h2 class="text-2xl font-semibold">Dodaj nowy przedmiot</h2>
      <form @submit.prevent="addItem">
        <div class="mt-4">
          <label for="name" class="block">Nazwa przedmiotu:</label>
          <input
              v-model="newItem.name"
              type="text"
              id="name"
              class="w-full p-2 border rounded"
              required
          />
        </div>
        <div class="mt-4">
          <label for="description" class="block">Opis przedmiotu:</label>
          <textarea
              v-model="newItem.description"
              id="description"
              class="w-full p-2 border rounded"
          ></textarea>
        </div>
        <button
            type="submit"
            class="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Dodaj przedmiot
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import CollectionService from "@/services/CollectionService";
import ItemService from "@/services/ItemService";

export default {
  name: "KolekcjeView",
  data() {
    return {
      collection: {},
      items: [],
      isLoading: true,
      showAddItemForm: false,
      newItem: {
        name: "",
        description: "",
      },
    };
  },
  async mounted() {
    try {
      const collectionId = this.$route.params.id;

      // Pobieranie szczegółów kolekcji
      const collectionResponse = await CollectionService.getCollection(collectionId);
      this.collection = collectionResponse.data;

      // Pobieranie przedmiotów w kolekcji
      const itemsResponse = await ItemService.getItemsByCollection(collectionId);
      this.items = itemsResponse.data;
    } catch (error) {
      console.error("Błąd pobierania danych:", error);
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async addItem() {
      try {
        const collectionId = this.$route.params.id;
        const newItemResponse = await ItemService.addItem({
          ...this.newItem,
          collectionId,
        });
        this.items.push(newItemResponse.data);
        this.newItem.name = "";
        this.newItem.description = "";
        this.showAddItemForm = false;
      } catch (error) {
        console.error("Błąd dodawania przedmiotu:", error);
      }
    },
  },
};
</script>

<style>
/* Dostosowane style */
</style>
