<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {useRoute} from 'vue-router'
import PushMessageProvider from '../providers/PushMessageProvider'
import type {IPushMessage} from '../interfaces/IPushMessage'

const {t} = useI18n()
const route = useRoute()

const loading = ref(false)
const error = ref(false)
const pushMessage = ref<IPushMessage | null>(null)

const pushMessageId = computed(() => String(route.params.idpush || ''))

async function loadPushMessage() {
  if (!pushMessageId.value) return

  loading.value = true
  error.value = false

  try {
    pushMessage.value = await PushMessageProvider.instance.publicFindById(pushMessageId.value)
  } catch (e) {
    console.error('Error loading push message:', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadPushMessage)
</script>

<template>
  <v-container fluid class="py-10">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-sheet border rounded class="pa-6 pa-md-8">
          <div class="d-flex align-center mb-6">
            <v-avatar color="primary" variant="tonal" class="mr-4">
              <v-icon icon="mdi-bell-check-outline" />
            </v-avatar>
            <div>
              <div class="text-h5">
                {{ t('push.reception.title') }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ t('push.reception.idLabel') }}: {{ pushMessageId }}
              </div>
            </div>
          </div>

          <v-progress-linear
            v-if="loading"
            indeterminate
            color="primary"
            class="mb-5"
          />

          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-5"
          >
            {{ t('push.reception.notFound') }}
          </v-alert>

          <template v-if="pushMessage">
            <v-row>
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ t('push.reception.messageTitle') }}
                </div>
                <div class="text-h6">
                  {{ pushMessage.title }}
                </div>
              </v-col>
              <v-col cols="12">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ t('push.reception.messageBody') }}
                </div>
                <div class="text-body-1">
                  {{ pushMessage.body }}
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-6" />

            <v-alert type="info" variant="tonal">
              {{ t('push.reception.technicalNote', {id: pushMessageId}) }}
            </v-alert>
          </template>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
