
<script setup lang="ts">
import {ref} from 'vue'
import ContactCrud from '../../cruds/ContactCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import ContactProvider from '../../providers/ContactProvider'
import type {IContact} from '../../interfaces/IContact'

const syncingIds = ref<Set<string>>(new Set())
const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

function chipValue(item: any) {
  return typeof item === 'string' ? item : item?.value
}

function getItem(item: any): IContact {
  return (item?.raw ?? item) as IContact
}

function setSyncing(id: string, value: boolean) {
  const next = new Set(syncingIds.value)
  if (value) {
    next.add(id)
  } else {
    next.delete(id)
  }
  syncingIds.value = next
}

function showSnackbar(message: string, color: 'success' | 'error') {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

async function syncGoogle(item: any) {
  const contact = getItem(item)
  if (!contact?._id || syncingIds.value.has(contact._id)) return

  setSyncing(contact._id, true)
  try {
    const synced = await ContactProvider.instance.syncGoogle(contact._id)
    Object.assign(contact, synced)
    showSnackbar('Contacto sincronizado con Google', 'success')
  } catch (e: any) {
    console.error('Error syncing contact with Google:', e)
    showSnackbar(e?.message ?? 'No se pudo sincronizar el contacto con Google', 'error')
  } finally {
    setSyncing(contact._id, false)
  }
}
</script>

<template>
  <crud :entity="ContactCrud.instance">
    <template v-slot:item.source="{value}">
      <v-chip size="x-small" variant="tonal">{{value}}</v-chip>
    </template>
    <template v-slot:item.status="{value}">
      <v-chip size="x-small" variant="tonal">{{value}}</v-chip>
    </template>
    <template v-slot:item.emails="{value}">
      <div class="contact-chip-list">
        <v-chip
            v-for="v in value"
            :key="chipValue(v)"
            size="x-small"
            variant="tonal"
        >
          {{ chipValue(v) }}
        </v-chip>
      </div>
    </template>
    <template v-slot:item.phones="{value}">
      <div class="contact-chip-list">
        <v-chip
            v-for="v in value"
            :key="chipValue(v)"
            size="x-small"
            variant="tonal"
        >
          {{ chipValue(v) }}
        </v-chip>
      </div>
    </template>
    <template v-slot:item.organization="{value}">
      {{ [value?.name, value?.title].filter(Boolean).join(' - ') }}
    </template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.lastSyncedAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.actions="{item}">
      <v-tooltip text="Sincronizar con Google">
        <template #activator="{ props }">
          <v-btn
              v-bind="props"
              icon="mdi-cloud-upload-outline"
              variant="text"
              color="primary"
              :loading="syncingIds.has(getItem(item)._id)"
              :disabled="syncingIds.has(getItem(item)._id)"
              @click.stop="syncGoogle(item)"
          />
        </template>
      </v-tooltip>
    </template>
  </crud>

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<style scoped>
.contact-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 240px;
}
</style>
