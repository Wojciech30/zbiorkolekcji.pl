<template>
  <div class="container mx-auto p-4">
    <!-- Nagłówek -->
    <header class="mb-8">
      <h1 class="text-4xl font-bold text-gray-800">Moje Kolekcje</h1>
      <p class="text-gray-600 mt-2">Zarządzaj swoimi kolekcjami</p>
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

        <button
            @click="openAddModal"
            class="btn-primary flex items-center gap-2"
        >
          <PlusIcon class="w-5 h-5" />
          Nowa Kolekcja
        </button>
      </div>

      <!-- Brak kolekcji -->
      <div v-if="collections.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
        <p class="text-gray-500">Nie masz jeszcze żadnych kolekcji</p>
      </div>

      <!-- Lista kolekcji -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
            v-for="collection in collections"
            :key="collection._id"
            class="group relative p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
        >
          <!-- Akcje dla właściciela -->
          <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
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

    <!-- Modal dodawania kolekcji -->
    <div v-if="isAddModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col" style="max-height: 90vh;">
        <div class="p-6 border-b border-gray-200 flex-shrink-0">
          <h3 class="text-2xl font-semibold">Nowa kolekcja</h3>
        </div>

        <form @submit.prevent="submitCollection" class="flex-1 flex flex-col overflow-hidden">
          <div class="flex-1 min-h-0 overflow-y-auto p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nazwa *</label>
                <input
                    v-model="newCollection.name"
                    type="text"
                    required
                    class="input-field"
                    :disabled="isProcessing"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                <textarea
                    v-model="newCollection.description"
                    class="input-field h-24"
                    :disabled="isProcessing"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategoria *</label>
                <select
                    v-model="newCollection.category"
                    class="input-field"
                    required
                    :disabled="isProcessing"
                >
                  <option v-for="category in categories" :value="category._id" :key="category._id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prywatność *</label>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2">
                    <input
                        type="radio"
                        v-model="newCollection.privacy"
                        value="public"
                        class="radio"
                    />
                    <span>Publiczna</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input
                        type="radio"
                        v-model="newCollection.privacy"
                        value="private"
                        class="radio"
                    />
                    <span>Prywatna</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Zdjęcie okładki</label>
                <input
                    type="file"
                    @change="handleFileUpload"
                    class="input-field"
                    accept="image/*"
                    :disabled="isProcessing"
                />
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex-shrink-0">
            <div class="flex justify-end gap-3">
              <button
                  type="button"
                  @click="closeAddModal"
                  class="btn-gray"
                  :disabled="isProcessing"
              >
                Anuluj
              </button>
              <button
                  type="submit"
                  class="btn-primary"
                  :disabled="isProcessing"
              >
                <span v-if="!isProcessing">Utwórz kolekcję</span>
                <Spinner v-else class="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import CollectionService from '@/services/CollectionService'
import CategoryService from '@/services/CategoryService'
import Spinner from '@/components/AppSpinner.vue'
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, DocumentTextIcon, EyeIcon } from '@heroicons/vue/24/outline'

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
  setup() {
    const router = useRouter()
    const store = useStore()
    const toast = useToast()

    const loading = ref(true)
    const isProcessing = ref(false)
    const isAddModalOpen = ref(false)
    const categories = ref([])

    const collections = ref([])
    const pagination = ref({
      page: 1,
      limit: 9,
      total: 0,
      pages: 1
    })

    const newCollection = ref({
      name: '',
      description: '',
      category: '',
      privacy: 'public',
      coverImage: null
    })

    const loadCollections = async () => {
      try {
        loading.value = true
        const response = await CollectionService.getUserCollections({
          page: pagination.value.page,
          limit: pagination.value.limit
        })

        collections.value = response.data.collections
        pagination.value = {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          pages: Math.ceil(response.data.total / response.data.limit)
        }
      } catch (error) {
        handleError(error, 'Błąd pobierania kolekcji')
      } finally {
        loading.value = false
      }
    }

    const openAddModal = async () => {
      try {
        const response = await CategoryService.getCategories()
        categories.value = response.data.categories
        isAddModalOpen.value = true
      } catch (error) {
        toast.error('Błąd ładowania kategorii')
      }
    }

    const closeAddModal = () => {
      isAddModalOpen.value = false
      newCollection.value = {
        name: '',
        description: '',
        category: '',
        privacy: 'public',
        coverImage: null
      }
    }

    const handleFileUpload = (event) => {
      newCollection.value.coverImage = event.target.files[0]
    }

    const submitCollection = async () => {
      try {
        isProcessing.value = true

        const formData = new FormData()
        formData.append('name', newCollection.value.name)
        formData.append('description', newCollection.value.description)
        formData.append('category', newCollection.value.category)
        formData.append('privacy', newCollection.value.privacy)
        if (newCollection.value.coverImage) {
          formData.append('coverImage', newCollection.value.coverImage)
        }

        await CollectionService.addCollection(formData)
        toast.success('Kolekcja utworzona pomyślnie!')

        // Reset paginacji i przeładuj
        pagination.value.page = 1
        await loadCollections()

        closeAddModal()
      } catch (error) {
        const message = error.response?.data?.message || 'Błąd podczas tworzenia kolekcji'
        toast.error(message)
      } finally {
        isProcessing.value = false
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
      if (!confirm('Czy na pewno chcesz usunąć tę kolekcję?')) return

      try {
        await CollectionService.deleteCollection(id)
        collections.value = collections.value.filter(c => c._id !== id)
        toast.success('Kolekcja usunięta')

        if (collections.value.length === 0 && pagination.value.page > 1) {
          pagination.value.page -= 1
          await loadCollections()
        }
      } catch (error) {
        handleError(error, 'Błąd usuwania kolekcji')
      }
    }

    const handleError = (error, defaultMessage) => {
      const message = error.response?.data?.message || defaultMessage
      toast.error(message)

      if (error.response?.status === 401) {
        store.dispatch('auth/logout')
        router.push('/login')
      }
    }

    onMounted(async () => {
      if (!store.getters['auth/isAuthenticated']) {
        await router.push({ name: 'Login' })
        return
      }
      await loadCollections()
    })

    return {
      loading,
      collections,
      pagination,
      isAddModalOpen,
      categories,
      newCollection,
      isProcessing,
      openAddModal,
      closeAddModal,
      handleFileUpload,
      submitCollection,
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

.input-field {
  @apply w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors;
}

.radio {
  @apply text-blue-600 focus:ring-blue-500;
}

.btn-gray {
  @apply bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors;
}
</style>