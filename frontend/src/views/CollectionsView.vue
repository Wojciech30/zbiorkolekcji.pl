<template>
  <div class="container mx-auto p-4">
    <!-- Header -->
    <header>
      <h1 class="text-4xl font-bold">{{ isViewingSingleCollection ? collection?.name : "Moje Kolekcje" }}</h1>
      <p v-if="isViewingSingleCollection" class="text-gray-600">{{ collection?.description }}</p>
    </header>

    <!-- Widok listy kolekcji -->
    <section v-if="!isViewingSingleCollection" class="mt-8">
      <h2 class="text-2xl font-semibold">Twoje Kolekcje</h2>
      <div v-if="isLoading" class="text-center">Ładowanie danych...</div>
      <div v-else-if="collections.length === 0" class="text-center">Brak kolekcji.</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="collection in collections" :key="collection._id" class="p-4 border rounded shadow hover:shadow-lg transition">
          <router-link :to="`/collection/${collection._id}`">
            <p class="text-xs text-gray-500">
              Właściciel: {{ collection.owner?.username || collection.owner }}
            </p>
            <h3 class="text-lg font-bold">{{ collection.name }}</h3>
            <p class="text-sm text-gray-500">{{ collection.description }}</p>
          </router-link>
          <button v-if="isOwner(collection) || isAdmin" @click="editCollection(collection)" class="text-blue-500 hover:underline">
            Edytuj
          </button>
          <button v-if="isOwner(collection) || isAdmin" @click="deleteCollection(collection._id)" class="text-red-500 hover:underline">
            Usuń
          </button>
        </div>
      </div>
      <button
          v-if="!showAddCollectionForm"
          @click="openAddCollectionForm"
          class="fixed bottom-12 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
      >
        Dodaj kolekcję
      </button>
    </section>

    <!-- Formularz dodawania kolekcji -->
    <section v-if="showAddCollectionForm" class="mt-8">
      <h2 class="text-2xl font-semibold">{{ isEditingCollection ? "Edytuj kolekcję" : "Dodaj kolekcję" }}</h2>
      <form @submit.prevent="handleCollectionForm" class="mt-4">
        <div class="mb-4">
          <label for="collectionName" class="block text-sm font-medium text-gray-700">Nazwa kolekcji</label>
          <input
              v-model="currentCollection.name"
              type="text"
              id="collectionName"
              class="w-full p-2 border rounded"
              required
          />
        </div>
        <div class="mb-4">
          <label for="collectionDescription" class="block text-sm font-medium text-gray-700">Opis kolekcji</label>
          <textarea
              v-model="currentCollection.description"
              id="collectionDescription"
              class="w-full p-2 border rounded"
          ></textarea>
        </div>
        <div class="mb-4">
          <label for="collectionCategory" class="block text-sm font-medium text-gray-700">Kategoria</label>
          <select
              v-model="currentCollection.categoryId"
              id="collectionCategory"
              class="w-full p-2 border rounded"
              required
          >
            <option value="" disabled>Wybierz kategorię</option>
            <option v-for="category in categories" :key="category._id" :value="category._id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="mb-4 flex items-center">
          <input
              type="checkbox"
              v-model="currentCollection.isPrivate"
              id="collectionPrivate"
              class="mr-2"
          />
          <label for="collectionPrivate" class="text-gray-700">Prywatna kolekcja</label>
        </div>
        <div class="flex justify-end space-x-2">
          <button
              type="button"
              class="p-2 bg-gray-300 rounded hover:bg-gray-400"
              @click="closeCollectionForm"
          >
            Anuluj
          </button>
          <button type="submit" class="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Zapisz
          </button>
        </div>
      </form>
    </section>

    <!-- Przycisk dodawania kolekcji -->
    <button
        v-if="!showAddCollectionForm"
        @click="openAddCollectionForm"
        class="fixed bottom-12 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-600"
    >
      Dodaj kolekcję
    </button>
  </div>
</template>

<script>
import CollectionService from "@/services/CollectionService";
import CategoryService from "@/services/CategoryService";
import {computed, ref} from "vue";
import { useToast } from "vue-toastification";
import store from "@/store";
import collection from "../../../backend/models/Collection";

export default {
  name: "CollectionsView",
  computed: {
    collection() {
      return collection
    }
  },
  setup() {
    const collections = ref([]);
    const categories = ref([]);
    const isLoading = ref(true);
    const showAddCollectionForm = ref(false);
    const isViewingSingleCollection = ref(false);
    const isEditingCollection = ref(false);
    const currentCollection = ref({ name: "", description: "", categoryId: "", isPrivate: false });
    const toast = useToast();
    const userId = computed(() => store.state.auth.user?._id);
    const isAdmin = computed(() => store.state.auth.user?.role === "admin");


    const isOwner = (collection) => {const ownerId = collection.owner?._id || collection.owner;return ownerId === userId.value;};

    const loadCollections = async () => {
      try {
        const endpoint = this.$route.name === 'MyCollections'
            ? CollectionService.getUserCollections
            : CollectionService.getPublicCollections;

        const response = await endpoint();
        collections.value = response.data.collections.map(c => ({
          ...c,
          owner: c.owner?._id ? c.owner : { _id: c.owner }
        }));

      } catch (error) {
        toast.error("Błąd ładowania kolekcji");
      } finally {
        isLoading.value = false;
      }
    };


    const loadCategories = async () => {
      try {
        const response = await CategoryService.getCategories();
        categories.value = response.data.categories;
      } catch (error) {
        console.error("Błąd pobierania kategorii:", error);
        toast.error("Nie udało się załadować kategorii.");
      }
    };

    const openAddCollectionForm = () => {
      currentCollection.value = { name: "", description: "", categoryId: "", isPrivate: false };
      isEditingCollection.value = false;
      showAddCollectionForm.value = true;
    };

    const closeCollectionForm = () => {
      showAddCollectionForm.value = false;
    };

    const handleCollectionForm = async () => {
      if (!store.state.auth.user?._id) {
        toast.error("Nie jesteś zalogowany!");
        return;
      }

      try {
        const collectionPayload = {
          name: currentCollection.value.name.trim(),
          description: currentCollection.value.description?.trim() || "",
          category: currentCollection.value.categoryId,
          privacy: currentCollection.value.isPrivate ? 'private' : 'public'
        };

        if (!collectionPayload.name || !collectionPayload.category) {
          toast.error("Wypełnij wymagane pola: nazwa i kategoria");
          return;
        }

        if (isEditingCollection.value) {
          const response = await CollectionService.updateCollection(
              currentCollection.value._id,
              collectionPayload
          );

          const updatedIndex = collections.value.findIndex(
              c => c._id === currentCollection.value._id
          );
          if (updatedIndex !== -1) {
            collections.value[updatedIndex] = {
              ...response.data.collection,
              owner: collections.value[updatedIndex].owner
            };
          }

          toast.success('Kolekcja zaktualizowana pomyślnie!');
        } else {
          const response = await CollectionService.addCollection(collectionPayload);

          const newCollection = {
            ...response.data.collection,
            owner: {
              _id: store.state.auth.user._id,
              username: store.state.auth.user.username
            },
            category: categories.value.find(c => c._id === collectionPayload.category)
          };

          collections.value = [newCollection, ...collections.value];
          toast.success('Kolekcja dodana pomyślnie!');
        }

        closeCollectionForm();
        await loadCollections(true);

      } catch (error) {
        console.error('Błąd:', error);
        const errorMessage = error.response?.data?.message
            || error.response?.data?.details?.join(', ')
            || 'Operacja nie powiodła się';

        toast.error(`Błąd: ${errorMessage}`);

        if (error.response?.status === 401) {
          setTimeout(() => window.location.reload(), 2000);
        }
      }
    };

    const deleteCollection = async (id) => {
      try {
        await CollectionService.deleteCollection(id);
        collections.value = collections.value.filter((c) => c._id !== id);
        toast.success("Kolekcja została usunięta.");
      } catch (error) {
        console.error("Błąd usuwania kolekcji:", error);
        toast.error("Nie udało się usunąć kolekcji.");
      }
    };

    const editCollection = (collection) => {
      currentCollection.value = { ...collection, isPrivate: collection.privacy === "private" };
      isEditingCollection.value = true;
      showAddCollectionForm.value = true;
    };

    loadCollections();
    loadCategories();

    return {
      collections,
      categories,
      isLoading,
      showAddCollectionForm,
      isEditingCollection,
      isViewingSingleCollection,
      currentCollection,
      openAddCollectionForm,
      closeCollectionForm,
      handleCollectionForm,
      deleteCollection,
      editCollection,
      isOwner,
      isAdmin,
    };
  },
};
</script>


<style>
/* Stylizacje */
</style>
