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

        <!-- Formularz dodawania -->
        <form @submit.prevent="addCategory" class="mb-6">
          <div class="space-y-4">
            <!-- Pole nazwy -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nazwa kategorii *</label>
              <input
                  v-model="newCategory"
                  type="text"
                  placeholder="Np. Książki"
                  class="input-field"
                  :disabled="isProcessing"
              />
            </div>

            <!-- Pole opisu -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Opis</label>
              <textarea
                  v-model="categoryDescription"
                  placeholder="Krótki opis kategorii"
                  class="input-field h-24"
                  :disabled="isProcessing"
              ></textarea>
            </div>

            <!-- Sekcja atrybutów -->
            <div>
              <h3 class="text-lg font-medium text-gray-700 mb-2">Atrybuty</h3>

              <div v-for="(attr, index) in selectedAttributes" :key="index"
                   class="bg-gray-50 p-4 rounded-lg mb-3 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <!-- Nazwa atrybutu -->
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Nazwa atrybutu *</label>
                    <input
                        v-model="attr.name"
                        type="text"
                        placeholder="Np. Autor"
                        class="input-field"
                    />
                  </div>

                  <!-- Typ atrybutu -->
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Typ *</label>
                    <select
                        v-model="attr.type"
                        class="input-field"
                    >
                      <option v-for="type in attributeTypes" :value="type.value" :key="type.value">
                        {{ type.label }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Wymagany -->
                <div class="flex items-center space-x-2">
                  <input
                      type="checkbox"
                      v-model="attr.required"
                      id="required"
                      class="checkbox"
                  />
                  <label for="required" class="text-sm text-gray-600">Wymagane pole</label>
                </div>

                <!-- Opcje dla typu 'select' -->
                <div v-if="attr.type === 'select'" class="space-y-2">
                  <label class="block text-sm text-gray-600">Opcje (oddziel przecinkami) *</label>
                  <input
                      v-model="attr.optionsInput"
                      type="text"
                      placeholder="Np. Horror,Komedia,Dramat"
                      class="input-field"
                      @change="updateOptions(index, $event.target.value)"
                  />
                </div>

                <button
                    type="button"
                    @click="removeAttribute(index)"
                    class="text-red-500 text-sm hover:text-red-700"
                >
                  Usuń atrybut
                </button>
              </div>

              <button
                  type="button"
                  @click="addAttribute"
                  class="btn-secondary mt-2"
              >
                + Dodaj atrybut
              </button>
            </div>

            <!-- Przycisk submit -->
            <button
                type="submit"
                class="btn-primary w-full"
                :disabled="isProcessing"
            >
              <span v-if="!isProcessing">Utwórz kategorię</span>
              <Spinner v-else class="w-5 h-5 mx-auto" />
            </button>
          </div>
        </form>

        <!-- Lista kategorii -->
        <ul class="space-y-2">
          <li
              v-for="category in categories"
              :key="category._id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="space-y-1">
              <span class="font-medium text-gray-700 block">{{ category.name }}</span>
              <span class="text-sm text-gray-500 block">{{ category.description || "Brak opisu" }}</span>
            </div>
            <div class="flex gap-3">
              <button
                  @click="openEditModal(category)"
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

      <!-- Modal edycji -->
      <div v-if="isEditModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col" style="max-height: 90vh;">
          <!-- Nagłówek modalu -->
          <div class="p-6 border-b border-gray-200 flex-shrink-0">
            <h3 class="text-2xl font-semibold">Edytuj kategorię</h3>
          </div>

          <!-- Główna zawartość modalu -->
          <form @submit.prevent="saveEditedCategory" class="flex-1 flex flex-col overflow-hidden">
            <!-- Przewijana sekcja -->
            <div class="flex-1 min-h-0 overflow-y-auto p-6">
              <div class="scrollable-area h-full p-6">
                <div class="space-y-4">
                <!-- Nazwa kategorii -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nazwa kategorii *</label>
                  <input
                      v-model="editedCategory.name"
                      type="text"
                      required
                      class="input-field"
                      :disabled="isProcessing"
                  />
                </div>

                <!-- Opis kategorii -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Opis</label>
                  <textarea
                      v-model="editedCategory.description"
                      class="input-field h-24"
                      :disabled="isProcessing"
                  ></textarea>
                </div>

                <!-- Atrybuty -->
                <div>
                  <h3 class="text-lg font-medium text-gray-700 mb-2">Atrybuty</h3>

                  <div
                      v-for="(attr, index) in editedCategory.attributes"
                      :key="index"
                      class="bg-gray-50 p-4 rounded-lg mb-3 space-y-3"
                  >
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <!-- Nazwa atrybutu -->
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Nazwa atrybutu *</label>
                        <input
                            v-model="attr.name"
                            type="text"
                            required
                            class="input-field"
                        />
                      </div>

                      <!-- Typ atrybutu -->
                      <div>
                        <label class="block text-sm text-gray-600 mb-1">Typ *</label>
                        <select
                            v-model="attr.type"
                            class="input-field"
                            required
                        >
                          <option v-for="type in attributeTypes" :value="type.value" :key="type.value">
                            {{ type.label }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <!-- Wymagany -->
                    <div class="flex items-center space-x-2">
                      <input
                          type="checkbox"
                          v-model="attr.required"
                          id="required"
                          class="checkbox"
                      />
                      <label for="required" class="text-sm text-gray-600">Wymagane pole</label>
                    </div>

                    <!-- Opcje dla typu 'select' -->
                    <div v-if="attr.type === 'select'" class="space-y-2">
                      <label class="block text-sm text-gray-600">Opcje (oddziel przecinkami) *</label>
                      <input
                          v-model="attr.optionsInput"
                          type="text"
                          required
                          class="input-field"
                          @change="updateEditOptions(index, $event.target.value)"
                      />
                    </div>

                    <button
                        type="button"
                        @click="removeEditAttribute(index)"
                        class="text-red-500 text-sm hover:text-red-700"
                    >
                      Usuń atrybut
                    </button>
                  </div>

                  <button
                      type="button"
                      @click="addEditAttribute"
                      class="btn-secondary mt-2"
                  >
                    + Dodaj atrybut
                  </button>
                </div>
              </div>
              </div>
            </div>


            <!-- Stopka modalu -->
            <div class="p-6 border-t border-gray-200 flex-shrink-0">
              <div class="flex justify-end gap-3">
                <button
                    type="button"
                    @click="closeEditModal"
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
                  <span v-if="!isProcessing">Zapisz zmiany</span>
                  <Spinner v-else class="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
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
import AppSpinner from "@/components/AppSpinner.vue"

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
    const categoryDescription = ref('')
    const selectedAttributes = ref([])
    const attributeTypes = [
      { value: 'text', label: 'Tekst' },
      { value: 'number', label: 'Liczba' },
      { value: 'date', label: 'Data' },
      { value: 'boolean', label: 'Tak/Nie' },
      { value: 'select', label: 'Lista wyboru' }
    ]
    const loading = ref(true)
    const isProcessing = ref(false)
    const isEditModalOpen = ref(false)
    const editedCategory = ref(null)

    const addAttribute = () => {
      selectedAttributes.value = [
        ...selectedAttributes.value,
        {
          name: '',
          type: 'text',
          required: false,
          options: [],
          optionsInput: ''
        }
      ]
    }

    const updateOptions = (index) => {
      selectedAttributes.value[index].options =
          selectedAttributes.value[index].optionsInput
              .split(',')
              .map(opt => opt.trim())
              .filter(opt => opt)
    }

    const removeAttribute = (index) => {
      selectedAttributes.value.splice(index, 1)
    }

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

    const openEditModal = (category) => {
      editedCategory.value = {
        _id: category._id,
        name: category.name,
        description: category.description,
        attributes: category.attributes.map(attr => ({
          ...attr,
          optionsInput: attr.options ? attr.options.join(', ') : ''
        }))
      }
      isEditModalOpen.value = true
    }

    const closeEditModal = () => {
      isEditModalOpen.value = false
      editedCategory.value = null
    }

    const addEditAttribute = () => {
      editedCategory.value.attributes.push({
        name: '',
        type: 'text',
        required: false,
        options: [],
        optionsInput: ''
      })
    }

    const removeEditAttribute = (index) => {
      editedCategory.value.attributes.splice(index, 1)
    }

    const updateEditOptions = (index, value) => {
      editedCategory.value.attributes[index].options = value
          .split(',')
          .map(opt => opt.trim())
          .filter(opt => opt)
    }

    const saveEditedCategory = async () => {
      try {
        isProcessing.value = true

        const updateData = {
          name: editedCategory.value.name,
          description: editedCategory.value.description,
          attributes: editedCategory.value.attributes.map(attr => {
            const cleanedAttr = { ...attr }
            if (cleanedAttr.type === 'select') {
              cleanedAttr.options = cleanedAttr.optionsInput.split(',').map(o => o.trim())
              delete cleanedAttr.optionsInput
            }
            return cleanedAttr
          })
        }

        const response = await CategoryService.updateCategory(
            editedCategory.value._id,
            updateData
        )

        categories.value = categories.value.map(c =>
            c._id === editedCategory.value._id ? response.data.category : c
        )

        closeEditModal()
        toast.success('Kategoria zaktualizowana pomyślnie!')
      } catch (error) {
        handleError(error, 'Błąd aktualizacji kategorii')
      } finally {
        isProcessing.value = false
      }
    }

    const handleError = (error, defaultMessage) => {
      const errorMap = {
        CATEGORY_NOT_FOUND: 'Kategoria nie istnieje',
        DUPLICATE_CATEGORY: 'Kategoria o tej nazwie już istnieje',
        VALIDATION_ERROR: 'Nieprawidłowe dane formularza'
      }

      const code = error.response?.data?.code
      const message = errorMap[code] || error.response?.data?.message || defaultMessage
      toast.error(message)
    }

    const addCategory = async () => {
      isProcessing.value = true;
      try {
        const categoryData = {
          name: newCategory.value.trim(),
          description: categoryDescription.value?.trim() || "",
          attributes: selectedAttributes.value || []
        };

        if (!categoryData.name) {
          toast.error('Nazwa kategorii nie może być pusta');
          return;
        }

        const response = await CategoryService.createCategory(categoryData);

        categories.value = [...categories.value, response.data.category];

        newCategory.value = '';
        categoryDescription.value = '';
        selectedAttributes.value = [];

        toast.success('Kategoria dodana pomyślnie!');

      } catch (error) {
        if (error.response?.data?.code === "DUPLICATE_CATEGORY") {
          toast.error('Kategoria o tej nazwie już istnieje');
          return;
        }

        const message = error.response?.data?.message
            || error.message
            || 'Błąd podczas dodawania kategorii';
        toast.error(message);

      } finally {
        isProcessing.value = false;
      }
    };

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
      isEditModalOpen,
      collections,
      newCategory,
      loading,
      editedCategory,
      selectedAttributes,
      categoryDescription,
      attributeTypes,
      isProcessing,
      addCategory,
      deleteCategory,
      addAttribute,
      removeAttribute,
      updateOptions,
      openEditModal,
      addEditAttribute,
      removeEditAttribute,
      updateEditOptions,
      saveEditedCategory,
      closeEditModal
    }
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors;
}

.checkbox {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors;
}

.btn-gray {
  @apply bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors;
}

.scrollable-area {
  scrollbar-width: thin;
  scrollbar-color: #3b82f6 #f1f1f1;
  -webkit-overflow-scrolling: touch;
}

.scrollable-area::-webkit-scrollbar {
  width: 8px;
}

.scrollable-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scrollable-area::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 4px;
}

.scrollable-area::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}
</style>

