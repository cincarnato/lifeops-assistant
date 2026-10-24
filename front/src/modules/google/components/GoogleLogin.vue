<script setup lang="ts">
import GoogleProvider from "@/modules/google/providers/GoogleProvider";
import {computed, onMounted, ref} from "vue";
import {IdentityRememberMe, useAuth} from "@drax/identity-vue";
import {useI18n} from "vue-i18n";
import {useDarkMode} from "@/composables/useDarkMode";

declare global {
  interface Window {
    gapi: any,
    handleCredentialResponse: (event: { credential: any }) => Promise<void>
  }
}

const {darkMode} = useDarkMode()
const {loginWithSession} = useAuth()
const rememberMe = ref(false)
const loading = ref(false)
const loginFailed = ref(false)
const {t} = useI18n({
  useScope: 'local',
  messages: {
    es: {loginFailed: 'No se pudo iniciar sesión con Google. Intentá nuevamente.'},
    en: {loginFailed: 'Could not sign in with Google. Please try again.'},
  },
})

async function loadGoogleScript() {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

const emit = defineEmits(['loginSuccess', 'loginFail'])

onMounted(async () => {
  await loadGoogleScript()
})

async function handleCredentialResponse(event: { credential: any }) {
  if (loading.value) return
  loading.value = true
  loginFailed.value = false
  try {
    await loginWithSession(
      effectiveRememberMe => GoogleProvider.instance.login(event.credential, effectiveRememberMe),
      rememberMe.value,
    )
    emit('loginSuccess')
  } catch {
    loginFailed.value = true
    emit('loginFail')
  } finally {
    loading.value = false
  }
}

const clientId = computed(() => import.meta.env.VITE_GOOGLE_CLIENT_ID)

// Expose the function to the global scope
window.handleCredentialResponse = handleCredentialResponse;

</script>

<template>
  <div v-if="clientId">
    <div id="g_id_onload"
         :data-client_id="clientId"
         data-callback="handleCredentialResponse"
    >
    </div>
    <div class="g_id_signin"
         data-type="standard"
         :data-theme="darkMode ? 'filled_black' : ''"
         data-shape="rectangular"
         style="color-scheme: light"
    ></div>
    <IdentityRememberMe v-model="rememberMe" :disabled="loading" />
    <v-progress-linear v-if="loading" indeterminate class="mt-2" />
    <v-alert v-if="loginFailed" type="error" variant="tonal" class="mt-2" role="alert">
      {{ t('loginFailed') }}
    </v-alert>
  </div>
</template>

<style scoped>

</style>
