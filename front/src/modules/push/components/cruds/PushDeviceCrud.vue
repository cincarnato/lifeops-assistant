
<script setup lang="ts">
import {computed, ref} from 'vue'
import PushDeviceCrud from '../../cruds/PushDeviceCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import PushMessageProvider from '../../providers/PushMessageProvider'
import type {IPushDevice} from '../../interfaces/IPushDevice'
import type {IPushMessage} from '../../interfaces/IPushMessage'

const selectedDevice = ref<IPushDevice | null>(null)
const dialog = ref(false)
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const createdMessage = ref<IPushMessage | null>(null)
const form = ref({
  title: 'Notificación de prueba',
  body: 'Este es un mensaje push de prueba.',
})

const canSend = computed(() => !!selectedDevice.value && !!form.value.title && !!form.value.body && !loading.value)

function getItem(item: any): IPushDevice {
  return (item?.raw ?? item) as IPushDevice
}

function getDeviceLabel(device: IPushDevice | null): string {
  if (!device) return ''

  return device.deviceName || device.platform || device._id
}

function openTestDialog(item: any) {
  const device = getItem(item)
  selectedDevice.value = device
  createdMessage.value = null
  errorMessage.value = null
  form.value = {
    title: 'Notificación de prueba',
    body: `Mensaje de prueba para ${getDeviceLabel(device)}`,
  }
  dialog.value = true
}

async function sendTest() {
  if (!selectedDevice.value || loading.value) return

  loading.value = true
  errorMessage.value = null
  createdMessage.value = null

  try {
    createdMessage.value = await PushMessageProvider.instance.sendTest({
      pushDeviceId: selectedDevice.value._id,
      title: form.value.title,
      body: form.value.body,
      type: 'test',
    })
  } catch (e: any) {
    console.error('Error sending test push message:', e)
    errorMessage.value = e?.message ?? 'No se pudo enviar la notificación de prueba'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <crud :entity="PushDeviceCrud.instance">
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.lastSeenAt="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.actions="{item}">
      <v-tooltip text="Enviar notificación de prueba">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-bell-ring-outline"
            variant="text"
            color="primary"
            :disabled="!getItem(item).enabled"
            @click.stop="openTestDialog(item)"
          />
        </template>
      </v-tooltip>
    </template>
  </crud>

  <v-dialog v-model="dialog" max-width="560">
    <v-card>
      <v-card-title>Notificación de prueba</v-card-title>
      <v-card-subtitle v-if="selectedDevice">
        {{ getDeviceLabel(selectedDevice) }}
      </v-card-subtitle>
      <v-card-text>
        <v-alert
          v-if="createdMessage"
          type="success"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          Mensaje registrado con estado {{ createdMessage.status }}
        </v-alert>
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>
        <v-text-field
          v-model="form.title"
          label="Título"
          variant="filled"
          :disabled="loading"
        />
        <v-textarea
          v-model="form.body"
          label="Mensaje"
          variant="filled"
          rows="3"
          :disabled="loading"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="dialog = false">
          Cerrar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-send"
          :loading="loading"
          :disabled="!canSend"
          @click="sendTest"
        >
          Enviar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>

</style>
