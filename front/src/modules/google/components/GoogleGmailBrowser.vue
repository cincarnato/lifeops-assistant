<script setup lang="ts">
import GoogleProvider from "@/modules/google/providers/GoogleProvider";
import type {
  IGoogleGmailMessage,
  IGoogleGmailMessageSummary,
} from "@/modules/google/interfaces/IGoogleGmail";

type GoogleConnection = {
  _id: string
  googleEmail: string
  scope?: string[]
  status: string
}

const loading = ref(false)
const detailLoading = ref(false)
const error = ref('')
const connections = ref<GoogleConnection[]>([])
const selectedConnectionId = ref<string | undefined>()
const messages = ref<IGoogleGmailMessageSummary[]>([])
const selectedMessage = ref<IGoogleGmailMessage | null>(null)
const nextPageToken = ref<string | undefined>()
const pageTokenStack = ref<string[]>([])
const currentPageToken = ref<string | undefined>()

const search = ref('')
const from = ref('')
const to = ref('')
const subject = ref('')
const labelId = ref('INBOX')
const unread = ref<boolean | null>(null)
const hasAttachment = ref<boolean | null>(null)
const limit = ref(10)

const connectionItems = computed(() => connections.value.map(connection => ({
  title: connection.googleEmail,
  value: connection._id,
})))

const labels = [
  {title: 'Inbox', value: 'INBOX'},
  {title: 'Enviados', value: 'SENT'},
  {title: 'Destacados', value: 'STARRED'},
  {title: 'Importantes', value: 'IMPORTANT'},
  {title: 'Todos', value: ''},
]

function displayAddress(address?: {name?: string; email: string}) {
  if (!address) return ''
  return address.name ? `${address.name} <${address.email}>` : address.email
}

function formatMessageDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

async function loadConnections() {
  const response = await GoogleProvider.instance.getMyConnections()
  connections.value = response.connections
    .filter(connection => connection.status === 'active')
    .filter(connection => (connection.scope || []).some((scope: string) => scope.includes('/gmail.')))

  if (!selectedConnectionId.value && connections.value.length) {
    selectedConnectionId.value = connections.value[0]._id
  }
}

async function loadMessages(pageToken?: string, pushCurrent = false) {
  loading.value = true
  error.value = ''
  try {
    if (!connections.value.length) {
      await loadConnections()
    }
    if (!selectedConnectionId.value) {
      messages.value = []
      selectedMessage.value = null
      return
    }

    const response = await GoogleProvider.instance.listGmailMessages({
      connectionId: selectedConnectionId.value,
      limit: limit.value,
      pageToken,
      search: search.value,
      from: from.value,
      to: to.value,
      subject: subject.value,
      labelIds: labelId.value ? [labelId.value] : [],
      unread: unread.value === null ? undefined : unread.value,
      hasAttachment: hasAttachment.value === null ? undefined : hasAttachment.value,
    })

    if (pushCurrent && currentPageToken.value) {
      pageTokenStack.value = [...pageTokenStack.value, currentPageToken.value]
    } else if (pushCurrent && !currentPageToken.value) {
      pageTokenStack.value = [...pageTokenStack.value, '']
    }

    currentPageToken.value = pageToken
    messages.value = response.items
    nextPageToken.value = response.nextPageToken
    selectedMessage.value = null
  } catch (e: any) {
    console.error('Gmail load error', e)
    error.value = e?.message || 'No se pudieron cargar los mails.'
  } finally {
    loading.value = false
  }
}

async function openMessage(message: IGoogleGmailMessageSummary) {
  detailLoading.value = true
  error.value = ''
  try {
    selectedMessage.value = await GoogleProvider.instance.getGmailMessage(message.id, selectedConnectionId.value)
  } catch (e: any) {
    console.error('Gmail message error', e)
    error.value = e?.message || 'No se pudo abrir el mail.'
  } finally {
    detailLoading.value = false
  }
}

function applyFilters() {
  pageTokenStack.value = []
  currentPageToken.value = undefined
  loadMessages()
}

function nextPage() {
  if (nextPageToken.value) {
    loadMessages(nextPageToken.value, true)
  }
}

function previousPage() {
  const stack = [...pageTokenStack.value]
  const previous = stack.pop()
  pageTokenStack.value = stack
  loadMessages(previous || undefined)
}

onMounted(async () => {
  await loadConnections()
  await loadMessages()
})
</script>

<template>
  <v-container fluid class="gmail-browser">
    <v-row>
      <v-col cols="12" xl="3">
        <v-sheet border rounded class="pa-4 gmail-browser__filters">
          <div class="d-flex align-center justify-space-between mb-4">
            <h1 class="text-h6">Mails</h1>
            <v-btn icon="mdi-refresh" variant="text" :loading="loading" @click="loadMessages(currentPageToken)" />
          </div>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
          </v-alert>

          <v-select
            v-model="selectedConnectionId"
            :items="connectionItems"
            label="Cuenta"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-3"
            @update:model-value="applyFilters"
          />

          <v-text-field
            v-model="search"
            label="Buscar"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            clearable
            class="mb-3"
            @keyup.enter="applyFilters"
          />

          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field v-model="from" label="De" variant="outlined" density="comfortable" clearable />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="to" label="Para" variant="outlined" density="comfortable" clearable />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="subject" label="Asunto" variant="outlined" density="comfortable" clearable />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="labelId" :items="labels" label="Carpeta" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="limit" :items="[10, 20, 50]" label="Cantidad" variant="outlined" density="comfortable" />
            </v-col>
          </v-row>

          <div class="d-flex ga-2 flex-wrap mb-4">
            <v-btn-toggle v-model="unread" density="comfortable" divided>
              <v-btn :value="null">Todos</v-btn>
              <v-btn :value="true">No leidos</v-btn>
              <v-btn :value="false">Leidos</v-btn>
            </v-btn-toggle>
            <v-btn-toggle v-model="hasAttachment" density="comfortable" divided>
              <v-btn :value="null">Adjuntos</v-btn>
              <v-btn :value="true">
                <v-icon icon="mdi-paperclip" />
              </v-btn>
            </v-btn-toggle>
          </div>

          <v-btn color="primary" block :loading="loading" @click="applyFilters">
            Filtrar
          </v-btn>
        </v-sheet>
      </v-col>

      <v-col cols="12" xl="9">
        <v-row>
          <v-col cols="12"  md="5">
            <v-sheet border rounded class="gmail-browser__list">
              <div class="gmail-browser__list-toolbar">
                <v-btn icon="mdi-chevron-left" variant="text" :disabled="pageTokenStack.length === 0 || loading" @click="previousPage" />
                <v-btn icon="mdi-chevron-right" variant="text" :disabled="!nextPageToken || loading" @click="nextPage" />
              </div>

              <v-progress-linear v-if="loading" indeterminate color="primary" />

              <v-list v-if="messages.length" lines="three">
                <v-list-item
                  v-for="message in messages"
                  :key="message.id"
                  :active="selectedMessage?.id === message.id"
                  @click="openMessage(message)"
                >
                  <template #prepend>
                    <v-icon :icon="message.unread ? 'mdi-email' : 'mdi-email-open-outline'" />
                  </template>
                  <v-list-item-title class="gmail-browser__subject">
                    {{ message.subject }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ displayAddress(message.from) }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    {{ message.snippet }}
                  </v-list-item-subtitle>
                  <template #append>
                    <div class="text-caption text-medium-emphasis gmail-browser__date">
                      {{ formatMessageDate(message.date) }}
                    </div>
                    <v-icon v-if="message.hasAttachments" icon="mdi-paperclip" size="small" />
                  </template>
                </v-list-item>
              </v-list>

              <v-empty-state
                v-else
                icon="mdi-email-search-outline"
                title="Sin mails"
                text="No hay mails para los filtros seleccionados."
              />
            </v-sheet>
          </v-col>

          <v-col cols="12" md="7">
            <v-sheet border rounded class="pa-4 gmail-browser__detail">
              <v-progress-linear v-if="detailLoading" indeterminate color="primary" class="mb-4" />

              <template v-if="selectedMessage">
                <div class="d-flex align-start justify-space-between ga-3 mb-2">
                  <h2 class="text-h6 gmail-browser__detail-title">{{ selectedMessage.subject }}</h2>
                  <v-chip v-if="selectedMessage.unread" color="primary" size="small">No leido</v-chip>
                </div>

                <div class="text-body-2 mb-1">
                  <strong>De:</strong> {{ displayAddress(selectedMessage.from) }}
                </div>
                <div class="text-body-2 mb-1">
                  <strong>Para:</strong> {{ selectedMessage.to.map(displayAddress).join(', ') }}
                </div>
                <div class="text-body-2 text-medium-emphasis mb-4">
                  {{ formatMessageDate(selectedMessage.date) }}
                </div>

                <div v-if="selectedMessage.attachments.length" class="d-flex ga-2 flex-wrap mb-4">
                  <v-chip
                    v-for="attachment in selectedMessage.attachments"
                    :key="`${attachment.filename}-${attachment.size}`"
                    prepend-icon="mdi-paperclip"
                    size="small"
                  >
                    {{ attachment.filename }}
                  </v-chip>
                </div>

                <div v-if="selectedMessage.bodyText" class="gmail-browser__body">
                  {{ selectedMessage.bodyText }}
                </div>
                <div v-else class="text-medium-emphasis">
                  {{ selectedMessage.snippet }}
                </div>
              </template>

              <v-empty-state
                v-else
                icon="mdi-email-open-outline"
                title="Selecciona un mail"
                text="El detalle se muestra al elegir un mensaje."
              />
            </v-sheet>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.gmail-browser__filters {
  position: sticky;
  top: 16px;
}

.gmail-browser__list {
  min-height: 70vh;
  overflow: hidden;
}

.gmail-browser__list-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
}

.gmail-browser__subject,
.gmail-browser__detail-title {
  white-space: normal;
  overflow-wrap: anywhere;
}

.gmail-browser__date {
  width: 96px;
  text-align: right;
}

.gmail-browser__detail {
  min-height: 70vh;
}

.gmail-browser__body {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.55;
}
</style>
