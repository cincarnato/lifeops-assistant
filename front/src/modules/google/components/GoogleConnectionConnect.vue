<script setup lang="ts">
import GoogleProvider from "@/modules/google/providers/GoogleProvider";

type GooglePermission = {
  key: string
  label: string
  scope: string
}

const loading = ref(false)
const error = ref('')
const permissions = ref<GooglePermission[]>([])
const selectedPermissions = ref<string[]>([
  'readMails',
])
const customScopes = ref('')
const connections = ref<any[]>([])

const redirectUri = computed(() => `${window.location.origin}/google/connections/callback`)

function createState() {
  const state = crypto.randomUUID()
  window.localStorage.setItem('googleConnectionOAuthState', state)
  return state
}

function parseCustomScopes() {
  return customScopes.value
    .split(/\s+/)
    .map(scope => scope.trim())
    .filter(scope => !!scope)
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    const [permissionsResponse, connectionsResponse] = await Promise.all([
      GoogleProvider.instance.getConnectionPermissions(),
      GoogleProvider.instance.getMyConnections(),
    ])

    permissions.value = permissionsResponse.permissions
    connections.value = connectionsResponse.connections
  } catch (e) {
    console.error('Google connection load error', e)
    error.value = 'No se pudo cargar la configuracion de Google.'
  } finally {
    loading.value = false
  }
}

async function connect() {
  loading.value = true
  error.value = ''

  try {
    const response = await GoogleProvider.instance.createConnectionAuthorizationUrl({
      permissions: selectedPermissions.value,
      scopes: parseCustomScopes(),
      redirectUri: redirectUri.value,
      state: createState(),
    })

    window.location.href = response.authorizationUrl
  } catch (e) {
    console.error('Google connection authorization error', e)
    error.value = 'No se pudo iniciar la conexion con Google.'
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" lg="7">
        <v-sheet border rounded class="pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <h2 class="text-h6">Conectar Google</h2>
              <div class="text-body-2 text-medium-emphasis">Selecciona los permisos a solicitar.</div>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-google"
              :loading="loading"
              :disabled="selectedPermissions.length === 0"
              @click="connect"
            >
              Conectar
            </v-btn>
          </div>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
          </v-alert>

          <v-row>
            <v-col
              v-for="permission in permissions"
              :key="permission.key"
              cols="12"
              md="6"
            >
              <v-checkbox
                v-model="selectedPermissions"
                :value="permission.key"
                :label="permission.label"
                :hint="permission.scope"
                persistent-hint
                density="compact"
              />
            </v-col>
          </v-row>

          <v-textarea
            v-model="customScopes"
            label="Scopes adicionales"
            placeholder="https://www.googleapis.com/auth/..."
            rows="3"
            auto-grow
            variant="outlined"
            density="comfortable"
            class="mt-2"
          />
        </v-sheet>
      </v-col>

      <v-col cols="12" lg="5">
        <v-sheet border rounded class="pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="text-h6">Conexiones actuales</h2>
            <v-btn icon="mdi-refresh" variant="text" :loading="loading" @click="loadData" />
          </div>

          <v-list v-if="connections.length" lines="three">
            <v-list-item
              v-for="connection in connections"
              :key="connection._id"
              :title="connection.googleEmail"
              :subtitle="`${connection.status} · ${connection.scope?.length || 0} permisos`"
            >
              <template #prepend>
                <v-icon icon="mdi-google" />
              </template>
            </v-list-item>
          </v-list>

          <v-empty-state
            v-else
            icon="mdi-link-off"
            title="Sin conexiones"
            text="No hay cuentas de Google conectadas."
          />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
