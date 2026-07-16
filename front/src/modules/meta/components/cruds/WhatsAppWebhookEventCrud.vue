
<script setup lang="ts">
import WhatsAppWebhookEventCrud from '../../cruds/WhatsAppWebhookEventCrud'
import {useI18n} from 'vue-i18n'
import {Crud, CrudFormField, useCrudStore} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import type {IEntityCrudField} from "@drax/crud-share";
import WhatsAppWebhookJsonField from '../WhatsAppWebhookJsonField.vue'

const entity = WhatsAppWebhookEventCrud.instance
const store = useCrudStore(entity.name)
const {t, te} = useI18n()

function fieldLabel(field: IEntityCrudField) {
  const key = `${entity.name.toLowerCase()}.field.${field.label ? field.label : field.name}`
  return te(key) ? t(key) : field.label
}

function statusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    PROCESSING: 'info',
    PROCESSED: 'success',
    IGNORED: 'secondary',
    ERROR: 'error',
  }

  return colors[status] ?? 'default'
}

function referenceLabel(value: any, fallbackKey: string) {
  return value?.name ?? value?.displayPhoneNumber ?? value?.[fallbackKey] ?? value?._id ?? value ?? '-'
}

function hasContent(value: any) {
  if (!value) {
    return false
  }

  return Object.values(value).some((item) => item !== undefined && item !== null && item !== '')
}

function isReadonlyOperation() {
  return ['view', 'delete'].includes(store.operation)
}

</script>

<template>
  <crud :entity="entity">
    <template v-slot:field.tenantId="{field, form}">
      <v-sheet v-if="isReadonlyOperation()" class="pa-3" border rounded>
        <div class="text-caption text-medium-emphasis">{{ fieldLabel(field) }}</div>
        <div class="text-body-1">{{ referenceLabel(form.tenantId, 'name') }}</div>
      </v-sheet>
      <crud-form-field v-else :entity="entity" :field="field" v-model="form[field.name]" />
    </template>

    <template v-slot:field.phoneNumberRef="{field, form}">
      <v-sheet v-if="isReadonlyOperation()" class="pa-3" border rounded>
        <div class="text-caption text-medium-emphasis">{{ fieldLabel(field) }}</div>
        <div class="text-body-1">{{ referenceLabel(form.phoneNumberRef, 'displayPhoneNumber') }}</div>
      </v-sheet>
      <crud-form-field v-else :entity="entity" :field="field" v-model="form[field.name]" />
    </template>

    <template v-slot:field.processingStatus="{field, form}">
      <v-sheet v-if="isReadonlyOperation()" class="pa-3" border rounded>
        <div class="text-caption text-medium-emphasis">{{ fieldLabel(field) }}</div>
        <v-chip class="mt-1" :color="statusColor(form.processingStatus)" size="small" variant="flat">
          {{ form.processingStatus }}
        </v-chip>
      </v-sheet>
      <crud-form-field v-else :entity="entity" :field="field" v-model="form[field.name]" />
    </template>

    <template v-slot:field.receivedAt="{field, form}">
      <v-sheet v-if="isReadonlyOperation()" class="pa-3" border rounded>
        <div class="text-caption text-medium-emphasis">{{ fieldLabel(field) }}</div>
        <div class="text-body-1">{{ formatDate(form.receivedAt) || '-' }}</div>
      </v-sheet>
      <crud-form-field v-else :entity="entity" :field="field" v-model="form[field.name]" />
    </template>

    <template v-slot:field.eventAt="{field, form}">
      <v-sheet v-if="isReadonlyOperation()" class="pa-3" border rounded>
        <div class="text-caption text-medium-emphasis">{{ fieldLabel(field) }}</div>
        <div class="text-body-1">{{ formatDate(form.eventAt) || '-' }}</div>
      </v-sheet>
      <crud-form-field v-else :entity="entity" :field="field" v-model="form[field.name]" />
    </template>

    <template v-slot:field.processedAt="{field, form}">
      <v-sheet v-if="isReadonlyOperation()" class="pa-3" border rounded>
        <div class="text-caption text-medium-emphasis">{{ fieldLabel(field) }}</div>
        <div class="text-body-1">{{ formatDate(form.processedAt) || '-' }}</div>
      </v-sheet>
      <crud-form-field v-else :entity="entity" :field="field" v-model="form[field.name]" />
    </template>

    <template v-slot:field.lastProcessingAttemptAt="{field, form}">
      <v-sheet v-if="isReadonlyOperation()" class="pa-3" border rounded>
        <div class="text-caption text-medium-emphasis">{{ fieldLabel(field) }}</div>
        <div class="text-body-1">{{ formatDate(form.lastProcessingAttemptAt) || '-' }}</div>
      </v-sheet>
      <crud-form-field v-else :entity="entity" :field="field" v-model="form[field.name]" />
    </template>

    <template v-slot:field.lastError="{field, form}">
      <whats-app-webhook-json-field
        v-if="isReadonlyOperation() && hasContent(form.lastError)"
        :label="fieldLabel(field)"
        :model-value="form.lastError"
        readonly
      />
      <v-sheet v-else-if="isReadonlyOperation()" class="pa-3" border rounded>
        <div class="text-caption text-medium-emphasis">{{ fieldLabel(field) }}</div>
        <div class="text-body-1">-</div>
      </v-sheet>
      <crud-form-field v-else :entity="entity" :field="field" v-model="form[field.name]" />
    </template>

    <template v-slot:field.payload="{field, modelValue, setValue}">
      <whats-app-webhook-json-field
        :label="fieldLabel(field)"
        :model-value="modelValue"
        :readonly="isReadonlyOperation()"
        @update:model-value="setValue"
      />
    </template>

    <template v-slot:item.tenantId="{value}">{{ value?.name }}</template>
    <template v-slot:item.phoneNumberRef="{value}">{{ value?.displayPhoneNumber }}</template>
    <template v-slot:item.receivedAt="{value}">{{ formatDate(value) }}</template>
    <template v-slot:item.eventAt="{value}">{{ formatDate(value) }}</template>
    <template v-slot:item.processingStatus="{value}">
      <v-chip :color="statusColor(value)" size="small" variant="flat">{{ value }}</v-chip>
    </template>
    <template v-slot:item.processedAt="{value}">{{ formatDate(value) }}</template>
    <template v-slot:item.lastProcessingAttemptAt="{value}">{{ formatDate(value) }}</template>
  </crud>
</template>

<style scoped>

</style>
