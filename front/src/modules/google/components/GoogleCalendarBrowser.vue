<script setup lang="ts">
import GoogleProvider from "@/modules/google/providers/GoogleProvider";
import type {
  IGoogleCalendarEvent,
  IGoogleCalendarItem,
} from "@/modules/google/interfaces/IGoogleCalendar";

type GoogleConnection = {
  _id: string
  googleEmail: string
  scope?: string[]
  status: string
}

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const connections = ref<GoogleConnection[]>([])
const calendars = ref<IGoogleCalendarItem[]>([])
const events = ref<IGoogleCalendarEvent[]>([])
const selectedConnectionId = ref<string | undefined>()
const selectedCalendarId = ref<string>('primary')
const selectedEvent = ref<IGoogleCalendarEvent | null>(null)
const createDialog = ref(false)
const nextPageToken = ref<string | undefined>()
const pageTokenStack = ref<string[]>([])
const currentPageToken = ref<string | undefined>()

const today = new Date()
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

const dateFrom = ref(toDateInput(monthStart))
const dateTo = ref(toDateInput(monthEnd))
const search = ref('')
const limit = ref(25)

const eventForm = ref({
  summary: '',
  location: '',
  description: '',
  start: toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000)),
  end: toDatetimeLocal(new Date(Date.now() + 2 * 60 * 60 * 1000)),
  attendees: '',
})

const connectionItems = computed(() => connections.value.map(connection => ({
  title: connection.googleEmail,
  value: connection._id,
})))

const calendarItems = computed(() => calendars.value.map(calendar => ({
  title: calendar.primary ? `${calendar.summary} (principal)` : calendar.summary,
  value: calendar.id,
})))

const canCreate = computed(() => {
  const connection = connections.value.find(item => item._id === selectedConnectionId.value)
  return (connection?.scope || []).some(scope => scope.includes('/calendar.events') || scope.endsWith('/calendar'))
})

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function toDatetimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toCalendarDateTime(value: string) {
  return {
    dateTime: new Date(value).toISOString(),
  }
}

function toTimeMin(value: string) {
  return new Date(`${value}T00:00:00`).toISOString()
}

function toTimeMax(value: string) {
  return new Date(`${value}T23:59:59`).toISOString()
}

function formatEventDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function formatEventRange(event: IGoogleCalendarEvent) {
  const start = formatEventDate(event.start.dateTime || event.start.date)
  const end = formatEventDate(event.end.dateTime || event.end.date)
  return [start, end].filter(Boolean).join(' - ')
}

async function loadConnections() {
  const response = await GoogleProvider.instance.getMyConnections()
  connections.value = response.connections
    .filter(connection => connection.status === 'active')
    .filter(connection => (connection.scope || []).some((scope: string) => scope.includes('/calendar')))

  if (!selectedConnectionId.value && connections.value.length) {
    selectedConnectionId.value = connections.value[0]._id
  }
}

async function loadCalendars() {
  if (!selectedConnectionId.value) {
    calendars.value = []
    selectedCalendarId.value = 'primary'
    return
  }

  const response = await GoogleProvider.instance.listCalendars({
    connectionId: selectedConnectionId.value,
  })
  calendars.value = response.items
  selectedCalendarId.value = response.items.find(calendar => calendar.primary)?.id || response.items[0]?.id || 'primary'
}

async function loadEvents(pageToken?: string, pushCurrent = false) {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    if (!connections.value.length) {
      await loadConnections()
    }
    if (!calendars.value.length) {
      await loadCalendars()
    }
    if (!selectedConnectionId.value || !selectedCalendarId.value) {
      events.value = []
      selectedEvent.value = null
      return
    }

    const response = await GoogleProvider.instance.listCalendarEvents({
      connectionId: selectedConnectionId.value,
      calendarId: selectedCalendarId.value,
      timeMin: toTimeMin(dateFrom.value),
      timeMax: toTimeMax(dateTo.value),
      search: search.value,
      pageToken,
      limit: limit.value,
    })

    if (pushCurrent) {
      pageTokenStack.value = [...pageTokenStack.value, currentPageToken.value || '']
    }

    currentPageToken.value = pageToken
    events.value = response.items
    nextPageToken.value = response.nextPageToken
    selectedEvent.value = response.items[0] || null
  } catch (e: any) {
    console.error('Calendar load error', e)
    error.value = e?.message || 'No se pudieron cargar los eventos.'
  } finally {
    loading.value = false
  }
}

async function reloadForConnection() {
  pageTokenStack.value = []
  currentPageToken.value = undefined
  nextPageToken.value = undefined
  await loadCalendars()
  await loadEvents()
}

function applyFilters() {
  pageTokenStack.value = []
  currentPageToken.value = undefined
  loadEvents()
}

function nextPage() {
  if (nextPageToken.value) {
    loadEvents(nextPageToken.value, true)
  }
}

function previousPage() {
  const stack = [...pageTokenStack.value]
  const previous = stack.pop()
  pageTokenStack.value = stack
  loadEvents(previous || undefined)
}

function openCreateDialog() {
  error.value = ''
  success.value = ''
  createDialog.value = true
}

async function createEvent() {
  if (!selectedConnectionId.value || !selectedCalendarId.value) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    const attendees = eventForm.value.attendees
      .split(',')
      .map(email => email.trim())
      .filter(Boolean)
      .map(email => ({email}))

    await GoogleProvider.instance.createCalendarEvent({
      connectionId: selectedConnectionId.value,
      calendarId: selectedCalendarId.value,
      summary: eventForm.value.summary,
      location: eventForm.value.location,
      description: eventForm.value.description,
      start: toCalendarDateTime(eventForm.value.start),
      end: toCalendarDateTime(eventForm.value.end),
      attendees,
    })

    createDialog.value = false
    success.value = 'Evento creado.'
    eventForm.value.summary = ''
    eventForm.value.location = ''
    eventForm.value.description = ''
    eventForm.value.attendees = ''
    await loadEvents(currentPageToken.value)
  } catch (e: any) {
    console.error('Calendar create error', e)
    error.value = e?.message || 'No se pudo crear el evento.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadConnections()
  await loadCalendars()
  await loadEvents()
})
</script>

<template>
  <v-container fluid class="calendar-browser">
    <v-row>
      <v-col cols="12" lg="3">
        <v-sheet border rounded class="pa-4 calendar-browser__filters">
          <div class="d-flex align-center justify-space-between mb-4">
            <h1 class="text-h6">Calendario</h1>
            <v-btn icon="mdi-refresh" variant="text" :loading="loading" @click="loadEvents(currentPageToken)" />
          </div>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
          </v-alert>
          <v-alert v-if="success" type="success" variant="tonal" class="mb-4">
            {{ success }}
          </v-alert>

          <v-select
            v-model="selectedConnectionId"
            :items="connectionItems"
            label="Cuenta"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-3"
            @update:model-value="reloadForConnection"
          />

          <v-select
            v-model="selectedCalendarId"
            :items="calendarItems"
            label="Calendario"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-3"
            @update:model-value="applyFilters"
          />

          <v-row dense>
            <v-col cols="12" md="6" lg="12" xl="6">
              <v-text-field v-model="dateFrom" type="date" label="Desde" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6" lg="12" xl="6">
              <v-text-field v-model="dateTo" type="date" label="Hasta" variant="outlined" density="comfortable" />
            </v-col>
          </v-row>

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

          <v-select v-model="limit" :items="[10, 25, 50, 100]" label="Cantidad" variant="outlined" density="comfortable" class="mb-4" />

          <div class="d-flex ga-2">
            <v-btn color="primary" :loading="loading" @click="applyFilters">
              Filtrar
            </v-btn>
            <v-btn prepend-icon="mdi-calendar-plus" variant="tonal" :disabled="!canCreate" @click="openCreateDialog">
              Nuevo
            </v-btn>
          </div>
        </v-sheet>
      </v-col>

      <v-col cols="12" lg="9">
        <v-row>
          <v-col cols="12" md="5">
            <v-sheet border rounded class="calendar-browser__list">
              <div class="calendar-browser__list-toolbar">
                <v-btn icon="mdi-chevron-left" variant="text" :disabled="pageTokenStack.length === 0 || loading" @click="previousPage" />
                <v-btn icon="mdi-chevron-right" variant="text" :disabled="!nextPageToken || loading" @click="nextPage" />
              </div>

              <v-progress-linear v-if="loading" indeterminate color="primary" />

              <v-list v-if="events.length" lines="three">
                <v-list-item
                  v-for="event in events"
                  :key="event.id"
                  :active="selectedEvent?.id === event.id"
                  @click="selectedEvent = event"
                >
                  <template #prepend>
                    <v-icon icon="mdi-calendar-clock-outline" />
                  </template>
                  <v-list-item-title class="calendar-browser__title">
                    {{ event.summary }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatEventRange(event) }}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    {{ event.location || event.description }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-empty-state
                v-else
                icon="mdi-calendar-search"
                title="Sin eventos"
                text="No hay eventos para el rango seleccionado."
              />
            </v-sheet>
          </v-col>

          <v-col cols="12" md="7">
            <v-sheet border rounded class="pa-4 calendar-browser__detail">
              <template v-if="selectedEvent">
                <div class="d-flex align-start justify-space-between ga-3 mb-3">
                  <h2 class="text-h6 calendar-browser__title">{{ selectedEvent.summary }}</h2>
                  <v-chip size="small" :color="selectedEvent.status === 'cancelled' ? 'error' : 'primary'">
                    {{ selectedEvent.status || 'confirmed' }}
                  </v-chip>
                </div>

                <div class="text-body-2 mb-2">
                  <strong>Horario:</strong> {{ formatEventRange(selectedEvent) }}
                </div>
                <div v-if="selectedEvent.location" class="text-body-2 mb-2">
                  <strong>Lugar:</strong> {{ selectedEvent.location }}
                </div>
                <div v-if="selectedEvent.organizer?.email" class="text-body-2 mb-2">
                  <strong>Organiza:</strong> {{ selectedEvent.organizer.displayName || selectedEvent.organizer.email }}
                </div>

                <div v-if="selectedEvent.attendees.length" class="d-flex ga-2 flex-wrap my-4">
                  <v-chip
                    v-for="attendee in selectedEvent.attendees"
                    :key="attendee.email"
                    prepend-icon="mdi-account-outline"
                    size="small"
                  >
                    {{ attendee.displayName || attendee.email }}
                  </v-chip>
                </div>

                <div v-if="selectedEvent.description" class="calendar-browser__description">
                  {{ selectedEvent.description }}
                </div>

                <v-btn
                  v-if="selectedEvent.htmlLink"
                  :href="selectedEvent.htmlLink"
                  target="_blank"
                  rel="noopener"
                  prepend-icon="mdi-open-in-new"
                  variant="tonal"
                  class="mt-4"
                >
                  Abrir en Google
                </v-btn>
              </template>

              <v-empty-state
                v-else
                icon="mdi-calendar-outline"
                title="Selecciona un evento"
                text="El detalle se muestra al elegir un evento."
              />
            </v-sheet>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="createDialog" max-width="720">
      <v-sheet rounded class="pa-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6">Nuevo evento</h2>
          <v-btn icon="mdi-close" variant="text" @click="createDialog = false" />
        </div>

        <v-text-field v-model="eventForm.summary" label="Titulo" variant="outlined" density="comfortable" class="mb-3" />
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field v-model="eventForm.start" type="datetime-local" label="Inicio" variant="outlined" density="comfortable" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="eventForm.end" type="datetime-local" label="Fin" variant="outlined" density="comfortable" />
          </v-col>
        </v-row>
        <v-text-field v-model="eventForm.location" label="Lugar" variant="outlined" density="comfortable" class="mb-3" />
        <v-text-field v-model="eventForm.attendees" label="Invitados" variant="outlined" density="comfortable" class="mb-3" />
        <v-textarea v-model="eventForm.description" label="Descripcion" variant="outlined" density="comfortable" rows="4" />

        <div class="d-flex justify-end ga-2 mt-4">
          <v-btn variant="text" @click="createDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!eventForm.summary" @click="createEvent">
            Crear
          </v-btn>
        </div>
      </v-sheet>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.calendar-browser__filters {
  position: sticky;
  top: 16px;
}

.calendar-browser__list {
  min-height: 70vh;
  overflow: hidden;
}

.calendar-browser__list-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
}

.calendar-browser__title {
  white-space: normal;
  overflow-wrap: anywhere;
}

.calendar-browser__detail {
  min-height: 70vh;
}

.calendar-browser__description {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.55;
}
</style>
