<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useShoppingList } from '../composables/useShoppingList'
import type { IShoppingItem } from '../interfaces/IShoppingItem'

const { t, d } = useI18n()
const { can, items, purchased, loading, saving, error, total, name, quantity, purchaseLocation,
  editing, hasMore, load, edit, resetForm, save, toggle, remove, purgePurchased } = useShoppingList()
const busy = computed(() => loading.value || saving.value)
const formElement = ref<HTMLElement | null>(null)
const deleting = ref<IShoppingItem | null>(null)
const purging = ref(false)

async function confirmPurge() {
  await purgePurchased()
  purging.value = false
}

async function startEdit(item: IShoppingItem) {
  edit(item)
  await nextTick()
  formElement.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  formElement.value?.querySelector('input')?.focus()
}

async function confirmDelete() {
  if (!deleting.value) return
  await remove(deleting.value)
  deleting.value = null
}

function dateLabel(item: IShoppingItem) {
  const date = item.purchased ? item.purchasedAt : item.createdAt
  if (!date) return ''
  return t(item.purchased ? 'shoppingitem.boughtOn' : 'shoppingitem.addedOn', {
    date: d(new Date(date), { dateStyle: 'short' }),
  })
}
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h5 font-weight-bold">{{ t('shoppingitem.menu') }}</h1>
          <v-btn icon="mdi-refresh" variant="text" :aria-label="t('shoppingitem.refresh')"
                 :disabled="busy" @click="load()" />
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" role="alert">
          {{ t('shoppingitem.error') }}
          <v-btn variant="text" :disabled="busy" @click="load()">{{ t('shoppingitem.retry') }}</v-btn>
        </v-alert>

        <div v-if="can('create') || editing" ref="formElement">
          <v-form class="mb-4" :disabled="busy" @submit.prevent="save">
            <div v-if="editing" class="text-subtitle-2 mb-2">{{ t('shoppingitem.edit') }}</div>
            <v-text-field v-model="name" :label="t('shoppingitem.field.name')" variant="outlined"
                          hide-details class="mb-3" autocomplete="off" :disabled="busy" />
            <v-text-field v-model="purchaseLocation" :label="t('shoppingitem.field.purchaseLocation')"
                          variant="outlined" hide-details class="mb-3" :disabled="busy" />
            <v-row dense align="center">
              <v-col cols="7" sm="8">
                <v-text-field v-model="quantity" :label="t('shoppingitem.field.quantity')"
                              :placeholder="t('shoppingitem.quantityExample')" variant="outlined"
                              hide-details :disabled="busy" />
              </v-col>
              <v-col cols="5" sm="4">
                <v-btn type="submit" color="primary" block size="large" :loading="saving"
                       :disabled="busy || !name.trim()" :prepend-icon="editing ? 'mdi-check' : 'mdi-plus'">
                  {{ t(editing ? 'shoppingitem.save' : 'shoppingitem.add') }}
                </v-btn>
              </v-col>
            </v-row>
            <v-btn v-if="editing" variant="text" class="mt-2" :disabled="busy" @click="resetForm">
              {{ t('shoppingitem.cancel') }}
            </v-btn>
          </v-form>
        </div>

        <v-btn-toggle v-model="purchased" mandatory divided color="primary" class="mb-4" :disabled="busy">
          <v-btn :value="false">{{ t('shoppingitem.pending') }}</v-btn>
          <v-btn :value="true">{{ t('shoppingitem.purchased') }}</v-btn>
        </v-btn-toggle>
        <v-btn v-if="purchased && can('delete')" color="error" variant="text"
               prepend-icon="mdi-delete-sweep-outline" class="mb-4"
               :disabled="busy || !total" @click="purging = true">
          {{ t('shoppingitem.purgePurchased') }}
        </v-btn>
        <div class="text-body-2 text-medium-emphasis mb-2">{{ t('shoppingitem.count', total) }}</div>
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-2" />

        <v-card v-if="items.length" variant="outlined" rounded="lg">
          <v-list lines="two" class="py-0">
            <template v-for="(item, index) in items" :key="item._id">
              <v-divider v-if="index" />
              <v-list-item class="px-2 py-2">
                <template #prepend>
                  <v-btn :icon="item.purchased ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline'"
                         variant="text" :color="item.purchased ? 'success' : undefined"
                         :aria-label="t(item.purchased ? 'shoppingitem.markPending' : 'shoppingitem.markPurchased', { name: item.name })"
                         :disabled="busy || !can('update')" @click="toggle(item)" />
                </template>
                <div class="text-body-1 text-break" :class="{ 'text-decoration-line-through text-medium-emphasis': item.purchased }">
                  {{ item.name }}
                </div>
                <div v-if="item.quantity" class="text-body-2 text-break">{{ item.quantity }}</div>
                <div v-if="item.purchaseLocation" class="text-body-2 text-break">
                  <v-icon icon="mdi-map-marker-outline" size="small" /> {{ item.purchaseLocation }}
                </div>
                <div class="text-caption text-medium-emphasis">{{ dateLabel(item) }}</div>
                <template #append>
                  <v-btn v-if="can('update')" icon="mdi-pencil-outline" variant="text" size="small"
                         :aria-label="t('shoppingitem.editItem', { name: item.name })" :disabled="busy" @click="startEdit(item)" />
                  <v-btn v-if="can('delete')" icon="mdi-trash-can-outline" variant="text" size="small"
                         :aria-label="t('shoppingitem.deleteItem', { name: item.name })" :disabled="busy" @click="deleting = item" />
                </template>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
        <div v-else-if="!loading && !error" class="text-center text-medium-emphasis py-10">
          <v-icon icon="mdi-cart-outline" size="48" class="mb-3" />
          <p>{{ t(purchased ? 'shoppingitem.emptyPurchased' : 'shoppingitem.emptyPending') }}</p>
        </div>
        <v-btn v-if="hasMore" block variant="text" class="mt-3" :disabled="busy" @click="load(true)">
          {{ t('shoppingitem.loadMore') }}
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="purging" max-width="400" :persistent="saving">
      <v-card :title="t('shoppingitem.purgePurchased')" :text="t('shoppingitem.purgeConfirm')">
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="saving" @click="purging = false">{{ t('shoppingitem.cancel') }}</v-btn>
          <v-btn color="error" :loading="saving" :disabled="busy" @click="confirmPurge">
            {{ t('shoppingitem.purgePurchased') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="!!deleting" max-width="400" :persistent="saving" @update:model-value="deleting = null">
      <v-card :title="t('shoppingitem.delete')" :text="t('shoppingitem.deleteConfirm', { name: deleting?.name })">
        <v-card-actions>
          <v-spacer />
          <v-btn :disabled="saving" @click="deleting = null">{{ t('shoppingitem.cancel') }}</v-btn>
          <v-btn color="error" :loading="saving" @click="confirmDelete">{{ t('shoppingitem.delete') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
