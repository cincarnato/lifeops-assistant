<script setup lang="ts">
import GoogleProvider from "@/modules/google/providers/GoogleProvider";
import type {
  IGoogleContact,
  IGoogleContactsSyncItem,
  IGoogleContactsSyncResult,
} from "@/modules/google/interfaces/IGoogleContacts";

type GoogleConnection = {
  _id: string
  googleEmail: string
  scope?: string[]
  status: string
}

const loading = ref(false)
const previewLoading = ref(false)
const error = ref('')
const connections = ref<GoogleConnection[]>([])
const selectedConnectionId = ref<string | undefined>()
const updateExisting = ref(true)
const limit = ref(100)
const previewContacts = ref<IGoogleContact[]>([])
const syncResult = ref<IGoogleContactsSyncResult | null>(null)

const connectionItems = computed(() => connections.value.map(connection => ({
  title: connection.googleEmail,
  value: connection._id,
})))

const resultItems = computed<IGoogleContactsSyncItem[]>(() => syncResult.value?.items || [])

const resultHeaders = [
  {title: 'Accion', key: 'action', sortable: true},
  {title: 'Nombre', key: 'displayName', sortable: true},
  {title: 'Emails', key: 'emails', sortable: false},
  {title: 'Telefonos', key: 'phones', sortable: false},
  {title: 'Motivo', key: 'reason', sortable: false},
]

const stats = computed(() => [
  {label: 'Google', value: syncResult.value?.totalGoogleContacts || 0, color: 'primary'},
  {label: 'Creados', value: syncResult.value?.created || 0, color: 'success'},
  {label: 'Actualizados', value: syncResult.value?.updated || 0, color: 'info'},
  {label: 'Omitidos', value: syncResult.value?.skipped || 0, color: 'warning'},
])

function contactDisplayName(contact: IGoogleContact) {
  const name = contact.names?.[0]
  return name?.displayName || contact.emailAddresses?.[0]?.value || contact.phoneNumbers?.[0]?.value || contact.resourceName
}

function formatValues(values: string[] = []) {
  return values.filter(Boolean).join(', ')
}

function actionColor(action: IGoogleContactsSyncItem['action']) {
  if (action === 'created') return 'success'
  if (action === 'updated') return 'info'
  return 'warning'
}

async function loadConnections() {
  const response = await GoogleProvider.instance.getMyConnections()
  connections.value = response.connections
    .filter(connection => connection.status === 'active')
    .filter(connection => (connection.scope || []).some((scope: string) => scope.includes('/contacts')))

  if (!selectedConnectionId.value && connections.value.length) {
    selectedConnectionId.value = connections.value[0]._id
  }
}

async function loadPreview() {
  previewLoading.value = true
  error.value = ''
  try {
    if (!connections.value.length) {
      await loadConnections()
    }
    if (!selectedConnectionId.value) {
      previewContacts.value = []
      return
    }

    const response = await GoogleProvider.instance.listContacts({
      connectionId: selectedConnectionId.value,
      limit: Math.min(limit.value || 10, 10),
      sortOrder: 'FIRST_NAME_ASCENDING',
    })
    previewContacts.value = response.items
  } catch (e: any) {
    console.error('Google contacts preview error', e)
    error.value = e?.message || 'No se pudieron cargar los contactos de Google.'
  } finally {
    previewLoading.value = false
  }
}

async function syncContacts() {
  loading.value = true
  error.value = ''
  syncResult.value = null
  try {
    if (!selectedConnectionId.value) {
      error.value = 'Selecciona una cuenta de Google con permisos de contactos.'
      return
    }

    syncResult.value = await GoogleProvider.instance.syncContacts({
      connectionId: selectedConnectionId.value,
      limit: limit.value,
      updateExisting: updateExisting.value,
    })
    await loadPreview()
  } catch (e: any) {
    console.error('Google contacts sync error', e)
    error.value = e?.message || 'No se pudieron sincronizar los contactos.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadConnections()
  await loadPreview()
})
</script>

<template>
  <v-container fluid class="google-contacts-sync">
    <v-row>
      <v-col cols="12" lg="4" xl="3">
        <v-sheet border rounded class="pa-4 google-contacts-sync__panel">
          <div class="d-flex align-center justify-space-between mb-4">
            <h1 class="text-h6">Contactos Google</h1>
            <v-btn icon="mdi-refresh" variant="text" :loading="previewLoading" @click="loadPreview" />
          </div>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
          </v-alert>

          <v-alert v-if="!connections.length && !previewLoading" type="warning" variant="tonal" class="mb-4">
            No hay cuentas activas con permisos de contactos.
          </v-alert>

          <v-select
            v-model="selectedConnectionId"
            :items="connectionItems"
            label="Cuenta"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-3"
            @update:model-value="loadPreview"
          />

          <v-text-field
            v-model="limit"
            label="Limite"
            type="number"
            min="1"
            max="1000"
            step="25"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-switch
            v-model="updateExisting"
            label="Actualizar contactos existentes"
            color="primary"
            hide-details
            class="mb-4"
          />

          <v-btn
            color="primary"
            prepend-icon="mdi-sync"
            block
            :loading="loading"
            :disabled="!selectedConnectionId"
            @click="syncContacts"
          >
            Sincronizar
          </v-btn>
        </v-sheet>
      </v-col>

      <v-col cols="12" lg="8" xl="9">
        <v-row class="mb-2">
          <v-col v-for="stat in stats" :key="stat.label" cols="6" md="3">
            <v-sheet border rounded class="pa-4">
              <div class="text-caption text-medium-emphasis">{{ stat.label }}</div>
              <div :class="`text-h5 text-${stat.color}`">{{ stat.value }}</div>
            </v-sheet>
          </v-col>
        </v-row>

        <v-sheet border rounded class="google-contacts-sync__results">
          <div class="google-contacts-sync__toolbar">
            <h2 class="text-subtitle-1">Resultado</h2>
            <v-progress-circular v-if="loading" indeterminate size="22" width="2" color="primary" />
          </div>

          <v-data-table
            v-if="resultItems.length"
            :headers="resultHeaders"
            :items="resultItems"
            density="comfortable"
            item-value="resourceName"
          >
            <template #item.action="{ item }">
              <v-chip :color="actionColor(item.action)" size="small" variant="tonal">
                {{ item.action }}
              </v-chip>
            </template>
            <template #item.emails="{ item }">
              {{ formatValues(item.emails) }}
            </template>
            <template #item.phones="{ item }">
              {{ formatValues(item.phones) }}
            </template>
          </v-data-table>

          <div v-else class="google-contacts-sync__empty">
            <v-icon icon="mdi-account-sync-outline" size="40" />
            <span>Ejecuta la sincronizacion para ver los cambios.</span>
          </div>
        </v-sheet>

        <v-sheet border rounded class="mt-4 google-contacts-sync__preview">
          <div class="google-contacts-sync__toolbar">
            <h2 class="text-subtitle-1">Vista previa</h2>
            <span class="text-caption text-medium-emphasis">{{ previewContacts.length }} contactos</span>
          </div>

          <v-progress-linear v-if="previewLoading" indeterminate color="primary" />

          <v-list v-if="previewContacts.length" lines="two">
            <v-list-item v-for="contact in previewContacts" :key="contact.resourceName">
              <template #prepend>
                <v-icon icon="mdi-account-circle-outline" />
              </template>
              <v-list-item-title>{{ contactDisplayName(contact) }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ contact.emailAddresses?.[0]?.value || contact.phoneNumbers?.[0]?.value || contact.resourceName }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <div v-else-if="!previewLoading" class="google-contacts-sync__empty">
            <v-icon icon="mdi-account-search-outline" size="40" />
            <span>No hay contactos para mostrar.</span>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.google-contacts-sync__panel {
  position: sticky;
  top: 16px;
}

.google-contacts-sync__results,
.google-contacts-sync__preview {
  overflow: hidden;
}

.google-contacts-sync__toolbar {
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.google-contacts-sync__empty {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgb(var(--v-theme-on-surface-variant));
  text-align: center;
  padding: 24px;
}
</style>
