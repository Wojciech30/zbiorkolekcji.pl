<template>
  <div class="container mx-auto p-4">
    <!-- Header -->
    <header v-if="collection">
      <h1 class="text-4xl font-bold">{{ collection?.name }}</h1>
      <p class="text-gray-600">{{ collection?.description }}</p>
      <p v-if="collection && collection.categoryId" class="text-sm text-gray-500">
        Kategoria:
        <router-link
            :to="`/category/${collection.categoryId?._id || collection.categoryId}`"
            class="text-blue-500 hover:underline"
        >
          {{ collection.categoryId?.name || "Nieznana kategoria" }}
        </router-link>
      </p>
    </header>

    <!-- Lista przedmiotów w kolekcji -->
    <section class="mt-8">
      <h2 class="text-2xl font-semibold">Przedmioty w tej kolekcji</h2>
      <div v-if="isLoading" class="text-center">Ładowanie danych...</div>
      <div v-else-if="items.length === 0" class="text-center">
        <p>Brak przedmiotów w tej kolekcji.</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
            v-for="item in items"
            :key="item._id"
            class="p-4 border rounded shadow hover:shadow-lg transition relative"
        >
          <img
              :src="item.imageUrl || '/placeholder.png'"
              alt="Zdjęcie przedmiotu"
              class="h-32 w-full object-cover mb-2"
          />
          <h3 class="text-lg font-bold">{{ item.name }}</h3>
          <p class="text-sm text-gray-500">{{ item.description }}</p>
          <div class="absolute top-2 right-2 flex space-x-2">
            <button
                v-if="canEdit"
                @click="updateItem(item)"
                class="text-blue-500 hover:underline"
            >
              Edytuj
            </button>
            <button
                v-if="canEdit"
                @click="deleteItem(item._id)"
                class="text-red-500 hover:underline"
            >
              Usuń
            </button>
          </div>
        </div>
      </div>
    </section>

    <button
        v-if="!isUserLoading && canEdit"
        @click="openAddItemForm"
        class="fixed bottom-12 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
    >
      Dodaj przedmiot
    </button>


    <!-- Formularz dodawania przedmiotu -->
    <div v-if="showAddItemForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-semibold mb-4">{{ isEditingItem ? "Edytuj przedmiot" : "Dodaj przedmiot" }}</h2>
        <form @submit.prevent="handleAddItem">
          <div class="mb-4">
            <label for="itemName" class="block text-sm font-medium text-gray-700">Nazwa przedmiotu</label>
            <input
                v-model="newItem.name"
                type="text"
                id="itemName"
                class="w-full p-2 border rounded"
                required
            />
          </div>
          <div class="mb-4">
            <label for="itemDescription" class="block text-sm font-medium text-gray-700">Opis przedmiotu</label>
            <textarea
                v-model="newItem.description"
                id="itemDescription"
                class="w-full p-2 border rounded"
            ></textarea>
          </div>
          <div class="mb-4">
            <label for="itemImageUrl" class="block text-sm font-medium text-gray-700">URL zdjęcia</label>
            <input
                v-model="newItem.imageUrl"
                type="text"
                id="itemImageUrl"
                class="w-full p-2 border rounded"
            />
          </div>
          <div class="flex justify-end space-x-2">
            <button @click="closeAddItemForm" type="button" class="p-2 bg-gray-300 rounded hover:bg-gray-400">
              Anuluj
            </button>
            <button type="submit" class="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Dodaj
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import ItemService from "@/services/ItemService";
import CollectionService from "@/services/CollectionService";
import { ref, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useRoute } from "vue-router";
import store from "@/store";

export default {
  name: "SingleCollectionView",
  setup() {
    const route = useRoute();
    const toast = useToast();
    const collection = ref({});
    const items = ref([]);
    const isLoading = ref(true);
    const showAddItemForm = ref(false);
    const newItem = ref({ name: "", description: "", imageUrl: "" });
    const userId = computed(() => store.state.auth.user?._id);
    const isEditingItem = ref(false);
    ref(true);
    const canEdit = computed(() => {
      return (
          collection.value?.owner?._id === userId.value ||
          store.state.auth.user?.role === "admin"
      );
    });

    const loadCollection = async () => {
      try {
        const response = await CollectionService.getCollection(route.params.id);
        collection.value = response.data;
        console.log("Załadowano kolekcję:", collection.value);
      } catch (error) {
        console.error("Błąd ładowania kolekcji:", error);
        toast.error("Nie udało się załadować kolekcji.");
      }
    };


    const updateItem = (item) => {
      isEditingItem.value = true;
      newItem.value = { ...item };
      showAddItemForm.value = true;
    };

    const loadItems = async () => {
      try {
        const response = await ItemService.getItemsByCollection(route.params.id);
        items.value = response.data;
      } catch (error) {
        console.error("Błąd ładowania przedmiotów:", error);
        toast.error("Nie udało się załadować przedmiotów.");
      }
    };

    const openAddItemForm = () => {
      console.log("Przycisk Dodaj przedmiot został kliknięty.");
      showAddItemForm.value = true;
    };

    const handleAddItem = async () => {
      try {
        if (isEditingItem.value) {
          await ItemService.updateItem(newItem.value._id, newItem.value);
          const index = items.value.findIndex((item) => item._id === newItem.value._id);
          if (index !== -1) {
            items.value[index] = { ...newItem.value };
          }
          toast.success("Przedmiot został zaktualizowany!");
        } else {
          const response = await ItemService.addItem({
            ...newItem.value,
            collectionId: collection.value._id,
          });
          items.value.push(response.data);
          toast.success("Przedmiot został dodany!");
        }
        closeAddItemForm();
      } catch (error) {
        console.error("Błąd zapisywania przedmiotu:", error);
        toast.error("Nie udało się zapisać przedmiotu.");
      }
    };

    const closeAddItemForm = () => {
      isEditingItem.value = false;
      showAddItemForm.value = false;
      newItem.value = { name: "", description: "", imageUrl: "" };
    };

    const deleteItem = async (itemId) => {
      try {
        await ItemService.deleteItem(itemId);
        items.value = items.value.filter((item) => item._id !== itemId);
        toast.success("Przedmiot został usunięty!");
      } catch (error) {
        console.error("Błąd usuwania przedmiotu:", error);
        toast.error("Nie udało się usunąć przedmiotu.");
      }
    };

    onMounted(async () => {
      console.log("Stan użytkownika po załadowaniu strony:", store.state.auth.user);
      isLoading.value = true;
      try {
        await Promise.all([store.dispatch("fetchProfile"), loadCollection()]);
        console.log("Kolekcja:", collection.value);
        console.log("Możliwość edycji:", canEdit.value);
        await loadItems();
      } catch (error) {
        console.error("Błąd ładowania danych:", error);
        toast.error("Nie udało się załadować danych.");
      } finally {
        isLoading.value = false;
      }
    });



    return {
      collection,
      items,
      isLoading,
      showAddItemForm,
      newItem,
      canEdit,
      openAddItemForm,
      handleAddItem,
      closeAddItemForm,
      updateItem,
      deleteItem,
    };
  },
};
</script>

<style>
/* Add styles as necessary */
</style>
