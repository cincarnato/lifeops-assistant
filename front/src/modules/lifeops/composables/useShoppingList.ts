import { computed, onMounted, ref, watch } from 'vue'
import { useAuth } from '@drax/identity-vue'
import ShoppingItemProvider from '../providers/ShoppingItemProvider'
import type { IShoppingItem } from '../interfaces/IShoppingItem'

export function useShoppingList() {
  const provider = ShoppingItemProvider.instance
  const { hasPermission } = useAuth()
  const can = (action: 'create' | 'update' | 'delete') =>
    hasPermission(`shoppingitem:${action}`) || hasPermission('shoppingitem:manage')
  const items = ref<IShoppingItem[]>([])
  const purchased = ref(false)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(false)
  const total = ref(0)
  const page = ref(1)
  const name = ref('')
  const quantity = ref('')
  const purchaseLocation = ref('')
  const editing = ref<IShoppingItem | null>(null)
  const hasMore = computed(() => items.value.length < total.value)

  async function load(append = false) {
    if (loading.value) return
    loading.value = true
    error.value = false
    try {
      const nextPage = append ? page.value + 1 : 1
      const result = await provider.paginate({
        page: nextPage, limit: 50,
        orderBy: purchased.value ? 'purchasedAt' : 'createdAt',
        order: purchased.value ? 'desc' : 'asc',
        filters: [{ field: 'purchased', operator: 'eq', value: purchased.value }],
      })
      items.value = append ? [...items.value, ...result.items] : result.items
      total.value = result.total
      page.value = nextPage
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  function resetForm() {
    editing.value = null
    name.value = ''
    quantity.value = ''
    purchaseLocation.value = ''
  }

  function edit(item: IShoppingItem) {
    editing.value = item
    name.value = item.name
    quantity.value = item.quantity ?? ''
    purchaseLocation.value = item.purchaseLocation ?? ''
  }

  async function mutate(action: () => Promise<unknown>) {
    if (saving.value || loading.value) return
    saving.value = true
    error.value = false
    try {
      await action()
      await load()
    } catch {
      error.value = true
    } finally {
      saving.value = false
    }
  }

  async function save() {
    if (!name.value.trim()) return
    await mutate(async () => {
      const data = {
        name: name.value.trim(), quantity: quantity.value.trim() || null,
        purchaseLocation: purchaseLocation.value.trim() || null,
      }
      if (editing.value) {
        await provider.updatePartial(editing.value._id, data)
      } else {
        await provider.create(data)
      }
      resetForm()
    })
  }

  async function toggle(item: IShoppingItem) {
    await mutate(() => provider.updatePartial(item._id, { purchased: !item.purchased }))
  }

  async function remove(item: IShoppingItem) {
    await mutate(async () => {
      await provider.delete(item._id)
      if (editing.value?._id === item._id) resetForm()
    })
  }

  async function purgePurchased() {
    await mutate(async () => {
      await provider.purgePurchased()
      if (editing.value?.purchased) resetForm()
    })
  }

  watch(purchased, () => { items.value = []; total.value = 0; void load() })
  onMounted(() => load())

  return { can, items, purchased, loading, saving, error, total, name, quantity, purchaseLocation,
    editing, hasMore, load, edit, resetForm, save, toggle, remove, purgePurchased }
}
