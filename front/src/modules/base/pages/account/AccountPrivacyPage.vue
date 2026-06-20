<script setup lang="ts">
import {computed, ref} from "vue";
import {useAuth} from "@drax/identity-vue";
import AccountProvider from "@/modules/base/providers/AccountProvider";

const auth = useAuth()

const confirmation = ref("")
const loading = ref(false)
const error = ref("")
const resultMessage = ref("")

const canDeactivate = computed(() => confirmation.value.trim() === "DESACTIVAR")

async function deactivateAccount() {
  if (!canDeactivate.value || loading.value) return

  loading.value = true
  error.value = ""
  resultMessage.value = ""

  try {
    const result = await AccountProvider.instance.deactivateAccount()
    resultMessage.value = `Cuenta desactivada. Conexiones de Google revocadas: ${result.googleConnectionsRevoked}.`
    auth.logout()
  } catch (e: any) {
    error.value = e?.message || "No se pudo desactivar la cuenta."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="account-privacy py-8">
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">Privacidad y cuenta</h1>
      <p class="text-body-2 text-medium-emphasis mb-0">
        Gestioná la desactivación de tu cuenta y la revocación de accesos conectados.
      </p>
    </div>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-alert
      v-if="resultMessage"
      type="success"
      variant="tonal"
      class="mb-4"
    >
      {{ resultMessage }}
    </v-alert>

    <v-card variant="outlined">
      <v-card-title class="text-h6">Desactivar cuenta</v-card-title>
      <v-card-text>
        <p class="mb-4">
          Al desactivar tu cuenta, LifeOps revocará los permisos otorgados a Google, marcará tus conexiones de Google
          como revocadas y pasará tu usuario a estado inactivo.
        </p>

        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          Después de confirmar, se cerrará tu sesión y no podrás volver a ingresar con esta cuenta mientras permanezca
          inactiva.
        </v-alert>

        <v-text-field
          v-model="confirmation"
          label="Escribí DESACTIVAR para confirmar"
          variant="outlined"
          autocomplete="off"
          :disabled="loading"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="error"
          variant="flat"
          :loading="loading"
          :disabled="!canDeactivate"
          @click="deactivateAccount"
        >
          Desactivar cuenta
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style scoped>
.account-privacy {
  max-width: 820px;
}
</style>
