<template>
  <div class="container mx-auto p-4">
    <!-- Nagłówek -->
    <header class="mb-8">
      <h1 class="text-4xl font-bold text-gray-800">Panel Administratora</h1>
      <p class="text-gray-600 mt-2">Zarządzaj kategoriami i kolekcjami użytkowników</p>
    </header>

    <!-- Ładowanie -->
    <div v-if="loading" class="text-center py-8">
      <Spinner class="w-12 h-12 mx-auto text-blue-500" />
    </div>

    <!-- Główna zawartość -->
    <div v-else>
      <!-- Sekcja kategorii -->
      <section class="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Zarządzanie kategoriami</h2>

        <form @submit.prevent="addCategory" class="mb-6">
          <div class="flex gap-4">
            <input
                v-model="newCategory"
                type="text"
                placeholder="Wprowadź nazwę kategorii"
                class="input-field"
                :disabled="isProcessing"
            />
            <button
                type="submit"
                class="btn-primary"
                :disabled="isProcessing"
            >
              <span v-if="!isProcessing">Dodaj kategorię</span>
              <Spinner v-else class="w-5 h-5 mx-auto" />
            </button>
          </div>
        </form>

        <ul class="space-y-2">
          <li
              v-for="category in categories"
              :key="category._id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <span class="font-medium text-gray-700">{{ category.name }}</span>
            <div class="flex gap-3">
              <button
                  @click="editCategory(category)"
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                  :disabled="isProcessing"
              >
                Edytuj
              </button>
              <button
                  @click="deleteCategory(category._id)"
                  class="text-red-600 hover:text-red-800 transition-colors"
                  :disabled="isProcessing"
              >
                Usuń
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- Sekcja kolekcji -->
      <section class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Wszystkie kolekcje</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
              v-for="collection in collections"
              :key="collection._id"
              class="p-4 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 class="font-bold text-lg mb-2">{{ collection.name }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ collection.description || "Brak opisu" }}</p>
            <div class="text-xs text-gray-500">
              <p>Kategoria: {{ collection.category?.name || "Nieprzypisane" }}</p>
              <p>Autor: {{ collection.owner?.username || "Nieznany" }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import CategoryService from '@/services/CategoryService'
import CollectionService from '@/services/CollectionService'
import AppSpinner from "@/components/AppSpinner.vue";

export default {
  name: 'AdminPanelView',
  components: { Spinner: AppSpinner },
  setup() {
    const router = useRouter()
    const store = useStore()
    const toast = useToast()

    const categories = ref([])
    const collections = ref([])
    const newCategory = ref('')
    const loading = ref(true)
    const isProcessing = ref(false)

    const checkAdminAccess = () => {
      if (!store.getters['auth/isAdmin']) {
        toast.error('Brak uprawnień administratora')
        router.push({ name: 'Home' })
      }
    }

    const loadData = async () => {
      try {
        const [categoriesResponse, collectionsResponse] = await Promise.allSettled([
          CategoryService.getCategories(),
          CollectionService.getCollections()
        ])

        categories.value = categoriesResponse.status === 'fulfilled'
            ? categoriesResponse.value.data.categories
            : []

        collections.value = collectionsResponse.status === 'fulfilled'
            ? collectionsResponse.value.data.collections
            : []

      } catch (error) {
        console.error('Błąd ładowania danych:', error)
        toast.error('Problem z pobraniem danych')
      } finally {
        loading.value = false
      }
    }

    const addCategory = async () => {
      isProcessing.value = true
      try {
        const categoryName = newCategory.value.trim()

        if (!categoryName) {
          toast.error('Nazwa kategorii nie może być pusta')
          return
        }

        const exists = categories.value.some(
            c => c.name.toLowerCase() === categoryName.toLowerCase()
        )

        if (exists) {
          toast.error('Kategoria o tej nazwie już istnieje')
          return
        }

        const response = await CategoryService.createCategory({ name: categoryName })
        categories.value = [...categories.value, response.data]
        newCategory.value = ''
        toast.success('Kategoria dodana pomyślnie!')

      } catch (error) {
        const message = error.response?.data?.message || 'Błąd podczas dodawania kategorii'
        toast.error(message)
      } finally {
        isProcessing.value = false
      }
    }

    const editCategory = async (category) => {
      const newName = prompt('Nowa nazwa kategorii:', category.name)
      if (!newName || newName.trim() === category.name) return

      isProcessing.value = true
      try {
        const response = await CategoryService.updateCategory(category._id, {
          name: newName.trim()
        })

        categories.value = categories.value.map(c =>
            c._id === category._id ? { ...c, name: response.data.name } : c
        )

        toast.success('Kategoria zaktualizowana!')
      } catch (error) {
        const message = error.response?.data?.message || 'Błąd podczas edycji kategorii'
        toast.error(message)
      } finally {
        isProcessing.value = false
      }
    }

    const deleteCategory = async (id) => {
      if (!confirm('Usunięcie kategorii spowoduje również usunięcie powiązanych kolekcji! Kontynuować?')) return

      isProcessing.value = true
      try {
        await CategoryService.deleteCategory(id)
        categories.value = categories.value.filter(c => c._id !== id)
        collections.value = collections.value.filter(c => c.category?._id !== id)
        toast.success('Kategoria i powiązane kolekcje zostały usunięte')
      } catch (error) {
        const message = error.response?.data?.message || 'Nie można usunąć kategorii w użyciu'
        toast.error(message)
      } finally {
        isProcessing.value = false
      }
    }

    onMounted(() => {
      checkAdminAccess()
      loadData()
    })

    return {
      categories,
      collections,
      newCategory,
      loading,
      isProcessing,
      addCategory,
      editCategory,
      deleteCategory
    }
  }
}
</script>

<style scoped>
.input-field {
  @apply border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all;
}

.btn-primary {
  @apply bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}
</style>