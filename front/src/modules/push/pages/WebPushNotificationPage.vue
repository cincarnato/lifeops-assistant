<script setup lang="ts">
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useAuth} from '@drax/identity-vue'
import WebPushNotificationService from '../services/WebPushNotificationService'

const {t} = useI18n()
const {isAuthenticated} = useAuth()

const service = WebPushNotificationService.instance
const loading = ref(false)
const permission = ref(service.getPermissionStatus())
const pushDeviceId = ref<string | null>(null)
const errorKey = ref<string | null>(null)
const guestLabel = ref('')
const supportStatus = computed(() => service.getSupportStatus())

const permissionLabel = computed(() => {
  if (permission.value === 'unsupported') {
    return t('push.web.status.unsupported')
  }

  return t(`push.web.permission.${permission.value}`)
})

const showGuestLabel = computed(() => !isAuthenticated())
const canRegister = computed(() => supportStatus.value.supported && !loading.value && permission.value !== 'unsupported')

async function registerWebPush() {
  if (loading.value) return

  loading.value = true
  errorKey.value = null
  pushDeviceId.value = null

  try {
    const result = await service.registerBrowser(showGuestLabel.value ? guestLabel.value : undefined)
    permission.value = result.permission
    pushDeviceId.value = result.pushDeviceId ?? null
  } catch (e: any) {
    permission.value = service.getPermissionStatus()
    errorKey.value = e?.message || 'push.web.error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-sheet border rounded class="pa-6">
          <div class="text-h5 mb-2">
            {{ t('push.web.title') }}
          </div>

          <div class="text-body-2 text-medium-emphasis mb-6">
            {{ t('push.web.status.current', {status: permissionLabel}) }}
          </div>

          <v-alert
            v-if="!supportStatus.supported"
            type="warning"
            variant="tonal"
            class="mb-5"
          >
            {{ t(supportStatus.reason || 'push.web.unsupported') }}
          </v-alert>

          <v-text-field
            v-if="showGuestLabel"
            v-model="guestLabel"
            class="mb-4"
            :label="t('push.web.fields.guestLabel')"
            :hint="t('push.web.hints.guestLabel')"
            maxlength="120"
            counter
            persistent-hint
            clearable
          />

          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-bell-ring"
            class="w-100 w-sm-auto"
            :loading="loading"
            :disabled="!canRegister"
            @click="registerWebPush"
          >
            {{ t('push.web.actions.enable') }}
          </v-btn>

          <div class="text-body-2 text-medium-emphasis mt-3">
            {{ t('push.web.enableDescription') }}
          </div>

          <v-alert
            v-if="pushDeviceId"
            class="mt-5"
            type="success"
            variant="tonal"
          >
            {{ t('push.web.status.enabled', {id: pushDeviceId}) }}
          </v-alert>

          <v-alert
            v-if="errorKey"
            class="mt-5"
            type="error"
            variant="tonal"
          >
            {{ t(errorKey) }}
          </v-alert>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
