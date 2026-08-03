<script setup lang="ts">
import {computed, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import WebPushNotificationService from '../services/WebPushNotificationService'

const {t} = useI18n()

const service = WebPushNotificationService.instance
const loading = ref(false)
const permission = ref(service.getPermissionStatus())
const pushDeviceId = ref<string | null>(null)
const errorKey = ref<string | null>(null)

const permissionLabel = computed(() => {
  if (permission.value === 'unsupported') {
    return t('push.web.status.unsupported')
  }

  return t(`push.web.permission.${permission.value}`)
})

async function registerWebPush() {
  if (loading.value) return

  loading.value = true
  errorKey.value = null
  pushDeviceId.value = null

  try {
    const result = await service.registerBrowser()
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

          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-bell-ring"
            :loading="loading"
            :disabled="loading || permission === 'unsupported'"
            @click="registerWebPush"
          >
            {{ t('push.web.actions.enable') }}
          </v-btn>

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
