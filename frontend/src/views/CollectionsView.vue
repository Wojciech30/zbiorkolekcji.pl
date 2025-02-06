<template>
  <div class="container mx-auto p-4">
    <!-- Nagłówek -->
    <header class="mb-8">
      <h1 class="text-4xl font-bold text-gray-800">
        {{ isUserCollections ? 'Moje Kolekcje' : 'Publiczne Kolekcje' }}
      </h1>
      <p class="text-gray-600 mt-2">
        {{ isUserCollections ? 'Zarządzaj swoimi kolekcjami' : 'Przeglądaj wszystkie publiczne kolekcje' }}
      </p>
    </header>

    <!-- Ładowanie -->
    <div v-if="loading" class="text-center py-8">
      <Spinner class="w-12 h-12 mx-auto text-blue-500" />
    </div>

    <!-- Główna zawartość -->
    <div v-else>
      <!-- Statystyki i przyciski akcji -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div class="stats-container">
          <span class="stat-item">
            Łącznie kolekcji: <strong>{{ pagination.total }}</strong>
          </span>
          <span class="stat-item">
            Strona: <strong>{{ pagination.page }}/{{ pagination.pages }}</strong>
          </span>
        </div>

        <router-link
            v-if="isUserCollections"
            to="/collections/new"
            class="btn-primary flex items-center gap-2"
        >
          <PlusIcon class="w-5 h-5" />
          Nowa Kolekcja
        </router-link>
      </div>

      <!-- Brak kolekcji -->
      <div v-if="collections.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
        <p class="text-gray-500">
          {{ isUserCollections ? 'Nie masz jeszcze żadnych kolekcji' : 'Brak dostępnych kolekcji' }}
        </p>
      </div>

      <!-- Lista kolekcji -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
            v-for="collection in collections"
            :key="collection._id"
            class="group relative p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
        >
          <!-- Akcje dla właściciela -->
          <div v-if="isUserCollections" class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <router-link
                :to="`/collections/${collection._id}/edit`"
                class="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                title="Edytuj"
            >
              <PencilIcon class="w-5 h-5" />
            </router-link>
            <button
                @click="deleteCollection(collection._id)"
                class="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                title="Usuń"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>

          <router-link :to="`/collection/${collection._id}`" class="block">
            <!-- Okładka -->
            <div class="mb-4 relative h-48 overflow-hidden rounded-lg">
              <img
                  :src="collection.coverImage || '/placeholder-collection.jpg'"
                  alt="Okładka kolekcji"
                  class="w-full h-full object-cover"
              />
            </div>

            <!-- Treść -->
            <h3 class="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition">
              {{ collection.name }}
            </h3>
            <p class="text-gray-600 mt-2 line-clamp-2">{{ collection.description }}</p>

            <!-- Statystyki -->
            <div class="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <div class="flex items-center gap-1">
                <UserIcon class="w-4 h-4" />
                <span>{{ collection.owner?.username }}</span>
              </div>
              <div class="flex items-center gap-1">
                <DocumentTextIcon class="w-4 h-4" />
                <span>{{ collection.itemsCount }} elementów</span>
              </div>
              <div class="flex items-center gap-1">
                <EyeIcon class="w-4 h-4" />
                <span>{{ collection.views }} wyświetleń</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Paginacja -->
      <div v-if="pagination.pages > 1" class="mt-8 flex justify-center gap-2">
        <button
            @click="changePage(-1)"
            :disabled="pagination.page === 1"
            class="btn-pagination"
        >
          &lt;
        </button>

        <span class="px-4 py-2 text-gray-700">
          Strona {{ pagination.page }} z {{ pagination.pages }}
        </span>

        <button
            @click="changePage(1)"
            :disabled="pagination.page >= pagination.pages"
            class="btn-pagination"
        >
          &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import CollectionService from '@/services/CollectionService'
import Spinner from '@/components/AppSpinner.vue'
import {PlusIcon, PencilIcon, TrashIcon, UserIcon, DocumentTextIcon, EyeIcon} from '@heroicons/vue/24/outline'

export default {
  name: 'CollectionsView',
  components: {
    Spinner,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    DocumentTextIcon,
    EyeIcon
  },
  props: {
    access: {
      type: String,
      default: 'public'
    }
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    const toast = useToast()

    const collection = ref()
    const isOwner = computed(() => collection.value?.owner?._id === store.state.auth.user?._id)
    const loading = ref(true)
    const collections = ref([])
    const pagination = ref({
      page: 1,
      limit: 9,
      total: 0,
      pages: 1
    })

    const isUserCollections = !isOwner.value

    const loadCollections = async () => {
      try {
        loading.value = true
        const serviceMethod = isUserCollections.value
            ? CollectionService.getUserCollections
            : CollectionService.getCollections

        const params = {
          page: pagination.value.page,
          limit: pagination.value.limit
        }

        const response = await serviceMethod(params)

        collections.value = response.data.collections
        pagination.value = {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          pages: response.data.pages
        }

      } catch (error) {
        handleError(error, 'Błąd pobierania kolekcji')
      } finally {
        loading.value = false
      }
    }

    const changePage = (delta) => {
      const newPage = pagination.value.page + delta
      if (newPage > 0 && newPage <= pagination.value.pages) {
        pagination.value.page = newPage
        loadCollections()
      }
    }

    const deleteCollection = async (id) => {
      if (!confirm('Czy na pewno chcesz usunąć tę kolekcję? Ta operacja jest nieodwracalna.')) return

      try {
        await CollectionService.deleteCollection(id)
        collections.value = collections.value.filter(c => c._id !== id)
        toast.success('Kolekcja została usunięta')
      } catch (error) {
        handleError(error, 'Błąd usuwania kolekcji')
      }
    }

    const handleError = (error, defaultMessage) => {
      const message = error.response?.data?.message || defaultMessage
      toast.error(message)
    }

    onMounted(async () => {
      if (isUserCollections.value && !store.getters['auth/isLoggedIn']) {
        await router.push({name: 'Login'})
        return
      }
      await loadCollections()
    })

    return {
      loading,
      collections,
      pagination,
      isUserCollections,
      changePage,
      deleteCollection
    }
  }
}
</script>

<style scoped>
.stats-container {
  @apply flex gap-4 text-sm text-gray-600;
}

.stat-item {
  @apply bg-gray-100 px-3 py-1 rounded-md;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center;
}

.btn-pagination {
  @apply px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>