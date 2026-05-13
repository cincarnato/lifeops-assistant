<script setup lang="ts">
import GoogleProvider from "@/modules/google/providers/GoogleProvider";

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')

const redirectUri = `${window.location.origin}/google/connections/callback`

async function completeConnection() {
  const code = route.query.code?.toString()
  const state = route.query.state?.toString()
  const savedState = window.localStorage.getItem('googleConnectionOAuthState')

  if (!code) {
    error.value = 'Google no devolvio un codigo de autorizacion.'
    loading.value = false
    return
  }

  if (!state || state !== savedState) {
    error.value = 'La respuesta de Google no coincide con la solicitud iniciada.'
    loading.value = false
    return
  }

  try {
    await GoogleProvider.instance.completeConnectionCallback({
      code,
      redirectUri,
    })
    window.localStorage.removeItem('googleConnectionOAuthState')
    await router.replace({name: 'GoogleConnectionPage'})
  } catch (e) {
    console.error('Google connection callback error', e)
    error.value = 'No se pudo completar la conexion con Google.'
    loading.value = false
  }
}

onMounted(completeConnection)
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-sheet border rounded class="pa-6 text-center">
          <v-progress-circular
            v-if="loading"
            indeterminate
            color="primary"
            size="48"
            class="mb-4"
          />
          <v-icon v-else icon="mdi-alert-circle-outline" color="error" size="48" class="mb-4" />
          <h1 class="text-h6 mb-2">Conexion de Google</h1>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ loading ? 'Completando autorizacion...' : error }}
          </p>
          <v-btn v-if="!loading" :to="{name: 'GoogleConnectionPage'}" color="primary">
            Volver
          </v-btn>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
