<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {useCrud} from '@drax/crud-vue'
import type {IEntityCrudOperation} from '@drax/crud-share'
import ContactCrud from '../cruds/ContactCrud'
import type {
  IContactAddress,
  IContactEmail,
  IContactPhone,
} from '../interfaces/IContact'

const props = defineProps<{
  item: Record<string, any>
  operation: IEntityCrudOperation
}>()

const {t} = useI18n()
const {onSubmit, onCancel, loading, error} = useCrud(ContactCrud.instance)
const tab = ref('general')

const photoInput = ref<HTMLInputElement>()
const localError = ref('')

const form = computed(() => props.item)
const readOnlyMode = computed(() => ['view', 'delete'].includes(props.operation ?? ''))
const isDelete = computed(() => props.operation === 'delete')
const statusColor = computed(() => {
  const colors: Record<string, string> = {
    active: 'primary',
    archived: 'warning',
    deleted: 'error',
  }
  return colors[String(form.value.status)] ?? 'secondary'
})
const namePreview = computed(() => {
  const structuredName = [form.value.givenName, form.value.familyName]
    .map(part => String(part ?? '').trim())
    .filter(Boolean)
    .join(' ')

  return structuredName || form.value.displayName?.trim() || form.value.nickname?.trim() || ''
})
const initials = computed(() => {
  if (!namePreview.value) return '?'
  return namePreview.value.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase()
})
const operationTitle = computed(() => t(`contact.form.operation.${props.operation ?? 'view'}`))

const statusItems = computed(() => [
  {title: t('contact.form.status.active'), value: 'active'},
  {title: t('contact.form.status.archived'), value: 'archived'},
  {title: t('contact.form.status.deleted'), value: 'deleted'},
])
const emailTypes = computed(() => [
  {title: t('contact.form.type.work'), value: 'work'},
  {title: t('contact.form.type.home'), value: 'home'},
  {title: t('contact.form.type.other'), value: 'other'},
])
const phoneTypes = computed(() => [
  {title: t('contact.form.type.mobile'), value: 'mobile'},
  ...emailTypes.value,
])
const addressTypes = computed(() => [
  {title: t('contact.form.type.work'), value: 'work'},
  {title: t('contact.form.type.home'), value: 'home'},
  {title: t('contact.form.type.other'), value: 'other'},
])
const sourceItems = ['manual', 'google', 'imported', 'api']
const monthItems = computed(() => Array.from({length: 12}, (_, index) => ({
  title: t(`contact.form.month.${index + 1}`),
  value: index + 1,
})))

watch(() => props.item, ensureShape, {immediate: true})

function ensureShape() {
  const value = form.value
  value.status ??= 'active'
  value.source ??= 'manual'
  value.emails = Array.isArray(value.emails) ? value.emails : []
  value.phones = Array.isArray(value.phones) ? value.phones : []
  value.addresses = Array.isArray(value.addresses) ? value.addresses : []
  value.tags = Array.isArray(value.tags) ? value.tags : []
  value.organization ??= {name: '', title: '', department: '', domain: ''}
  value.birthday ??= {year: null, month: null, day: null}
}

function addEmail() {
  form.value.emails.push({value: '', type: 'other', primary: form.value.emails.length === 0})
}

function addPhone() {
  form.value.phones.push({value: '', normalizedValue: '', type: 'mobile', primary: form.value.phones.length === 0})
}

function addAddress() {
  form.value.addresses.push({type: 'other', primary: form.value.addresses.length === 0})
}

function removeItem<T extends {primary?: boolean}>(collection: T[], index: number) {
  const wasPrimary = collection[index]?.primary
  collection.splice(index, 1)
  if (wasPrimary && collection.length) collection[0].primary = true
}

function setPrimary(collection: Array<{primary?: boolean}>, selected: number) {
  collection.forEach((entry, index) => entry.primary = index === selected)
}

function choosePhoto() {
  if (!readOnlyMode.value) photoInput.value?.click()
}

function loadPhoto(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    localError.value = t('contact.form.photoTooLarge')
    return
  }
  const reader = new FileReader()
  reader.onload = () => form.value.photoUrl = String(reader.result ?? '')
  reader.readAsDataURL(file)
}

function formatSyncDate(value: string | Date | undefined) {
  if (!value) return t('contact.form.neverSynced')
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

async function submit() {
  localError.value = ''
  await onSubmit(form.value)
}
</script>

<template>
  <v-form class="contact-form" @submit.prevent="submit">
    <div class="contact-form__heading d-flex align-center justify-space-between ga-3 mb-4">
      <div class="min-width-0">
        <div class="text-caption text-medium-emphasis mb-1">{{ operationTitle }}</div>
        <h2 class="text-h5 font-weight-bold text-truncate">
          {{ namePreview || t('contact.form.newContact') }}
        </h2>
      </div>
      <v-chip :color="statusColor" size="small" variant="tonal">
        <v-icon icon="mdi-circle" size="8" start />
        {{ t(`contact.form.status.${form.status}`) }}
      </v-chip>
    </div>

    <v-alert v-if="isDelete" type="warning" variant="tonal" class="mb-4">
      {{ t('contact.form.deleteWarning') }}
    </v-alert>
    <v-alert v-if="localError || error" type="error" variant="tonal" class="mb-4">
      {{ localError || error }}
    </v-alert>

    <v-card class="contact-form__profile mb-4" rounded="xl" elevation="1">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="3" class="d-flex flex-column align-center">
            <div class="contact-form__avatar-wrap mb-2" @click="choosePhoto">
              <v-avatar size="96" color="primary" variant="tonal">
                <v-img v-if="form.photoUrl" :src="form.photoUrl" cover />
                <span v-else class="text-h5 font-weight-bold">{{ initials }}</span>
              </v-avatar>
              <v-btn
                v-if="!readOnlyMode"
                class="contact-form__camera"
                color="primary"
                icon="mdi-camera"
                size="small"
                :aria-label="t('contact.form.changePhoto')"
              />
              <input ref="photoInput" class="d-none" type="file" accept="image/png,image/jpeg,image/webp" @change="loadPhoto">
            </div>
            <span class="text-caption text-medium-emphasis text-center">{{ t('contact.form.photoHint') }}</span>
          </v-col>

          <v-col cols="12" md="9">
            <div class="d-flex align-center ga-2 mb-3">
              <v-icon icon="mdi-badge-account-outline" color="primary" />
              <div>
                <div class="contact-form__label mb-0">{{ t('contact.form.googleDisplayName') }}</div>
                <div class="text-body-1 font-weight-medium">{{ namePreview || t('contact.form.newContact') }}</div>
              </div>
            </div>
            <v-row dense>
              <v-col cols="12" sm="6">
                <label class="contact-form__label">{{ t('contact.form.givenName') }}</label>
                <v-text-field v-model="form.givenName" :readonly="readOnlyMode" variant="solo-filled" flat hide-details />
              </v-col>
              <v-col cols="12" sm="6">
                <label class="contact-form__label">{{ t('contact.form.familyName') }}</label>
                <v-text-field v-model="form.familyName" :readonly="readOnlyMode" variant="solo-filled" flat hide-details />
              </v-col>
              <v-col cols="12">
                <label class="contact-form__label">{{ t('contact.form.nickname') }}</label>
                <v-text-field v-model="form.nickname" :readonly="readOnlyMode" variant="solo-filled" flat hide-details />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-tabs
      v-model="tab"
      class="contact-form__tabs mb-4"
      color="primary"
      grow
      show-arrows
      density="compact"
      rounded="lg"
    >
      <v-tab value="general" prepend-icon="mdi-card-account-details-outline">{{ t('contact.form.tabs.general') }}</v-tab>
      <v-tab value="addresses" prepend-icon="mdi-map-marker-outline">
        {{ t('contact.form.tabs.addresses') }}
        <v-chip size="x-small" class="ml-2">{{ form.addresses.length }}</v-chip>
      </v-tab>
      <v-tab value="more" prepend-icon="mdi-dots-horizontal">{{ t('contact.form.tabs.more') }}</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="general">
        <v-row>
          <v-col cols="12" lg="6">
            <v-card rounded="lg" elevation="1" height="100%">
              <v-card-title class="contact-form__section-title">
                <v-icon color="primary" icon="mdi-phone-outline" />
                {{ t('contact.form.phones') }}
                <v-spacer />
                <span class="text-caption text-medium-emphasis">{{ t('contact.form.registered', {count: form.phones.length}) }}</span>
              </v-card-title>
              <v-divider />
              <v-card-text class="d-flex flex-column ga-2">
                <div v-for="(phone, index) in form.phones as IContactPhone[]" :key="index" class="contact-form__channel d-flex align-center ga-2">
                  <v-btn
                    :icon="phone.primary ? 'mdi-star' : 'mdi-star-outline'"
                    :color="phone.primary ? 'primary' : 'secondary'"
                    variant="text"
                    size="small"
                    :disabled="readOnlyMode"
                    :aria-label="t('contact.form.makePrimary')"
                    @click="setPrimary(form.phones, index)"
                  />
                  <v-text-field v-model="phone.value" :readonly="readOnlyMode" :placeholder="t('contact.form.phonePlaceholder')" variant="plain" hide-details density="compact" />
                  <v-select v-model="phone.type" :readonly="readOnlyMode" :items="phoneTypes" variant="plain" hide-details density="compact" class="contact-form__type-select" />
                  <v-btn v-if="!readOnlyMode" icon="mdi-close" color="secondary" variant="text" size="small" @click="removeItem(form.phones, index)" />
                </div>
                <v-btn v-if="!readOnlyMode" prepend-icon="mdi-plus" color="primary" variant="tonal" block @click="addPhone">
                  {{ t('contact.form.addPhone') }}
                </v-btn>
                <div v-if="!form.phones.length && readOnlyMode" class="text-body-2 text-medium-emphasis">{{ t('contact.form.noData') }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card rounded="lg" elevation="1" height="100%">
              <v-card-title class="contact-form__section-title">
                <v-icon color="primary" icon="mdi-email-outline" />
                {{ t('contact.form.emails') }}
                <v-spacer />
                <span class="text-caption text-medium-emphasis">{{ t('contact.form.registered', {count: form.emails.length}) }}</span>
              </v-card-title>
              <v-divider />
              <v-card-text class="d-flex flex-column ga-2">
                <div v-for="(email, index) in form.emails as IContactEmail[]" :key="index" class="contact-form__channel d-flex align-center ga-2">
                  <v-btn
                    :icon="email.primary ? 'mdi-star' : 'mdi-star-outline'"
                    :color="email.primary ? 'primary' : 'secondary'"
                    variant="text"
                    size="small"
                    :disabled="readOnlyMode"
                    :aria-label="t('contact.form.makePrimary')"
                    @click="setPrimary(form.emails, index)"
                  />
                  <v-text-field v-model="email.value" :readonly="readOnlyMode" type="email" :placeholder="t('contact.form.emailPlaceholder')" variant="plain" hide-details density="compact" />
                  <v-select v-model="email.type" :readonly="readOnlyMode" :items="emailTypes" variant="plain" hide-details density="compact" class="contact-form__type-select" />
                  <v-btn v-if="!readOnlyMode" icon="mdi-close" color="secondary" variant="text" size="small" @click="removeItem(form.emails, index)" />
                </div>
                <v-btn v-if="!readOnlyMode" prepend-icon="mdi-plus" color="primary" variant="tonal" block @click="addEmail">
                  {{ t('contact.form.addEmail') }}
                </v-btn>
                <div v-if="!form.emails.length && readOnlyMode" class="text-body-2 text-medium-emphasis">{{ t('contact.form.noData') }}</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12">
            <v-card rounded="lg" elevation="1">
              <v-card-title class="contact-form__section-title">
                <v-icon color="primary" icon="mdi-domain" />
                <div>
                  <div>{{ t('contact.form.organization') }}</div>
                  <div class="text-caption text-medium-emphasis font-weight-regular">{{ t('contact.form.organizationHint') }}</div>
                </div>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-row dense>
                  <v-col cols="12" md="6" lg="3">
                    <label class="contact-form__label">{{ t('contact.form.organizationName') }}</label>
                    <v-text-field v-model="form.organization.name" :readonly="readOnlyMode" prepend-inner-icon="mdi-office-building-outline" variant="solo-filled" flat hide-details />
                  </v-col>
                  <v-col cols="12" md="6" lg="3">
                    <label class="contact-form__label">{{ t('contact.form.title') }}</label>
                    <v-text-field v-model="form.organization.title" :readonly="readOnlyMode" prepend-inner-icon="mdi-briefcase-outline" variant="solo-filled" flat hide-details />
                  </v-col>
                  <v-col cols="12" md="6" lg="3">
                    <label class="contact-form__label">{{ t('contact.form.department') }}</label>
                    <v-text-field v-model="form.organization.department" :readonly="readOnlyMode" prepend-inner-icon="mdi-hub-outline" variant="solo-filled" flat hide-details />
                  </v-col>
                  <v-col cols="12" md="6" lg="3">
                    <label class="contact-form__label">{{ t('contact.form.domain') }}</label>
                    <v-text-field v-model="form.organization.domain" :readonly="readOnlyMode" prepend-inner-icon="mdi-web" variant="solo-filled" flat hide-details />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>

      <v-tabs-window-item value="addresses">
        <div class="d-flex align-center justify-space-between ga-3 mb-3">
          <div>
            <h3 class="text-h6 font-weight-bold">{{ t('contact.form.addressesTitle') }}</h3>
            <p class="text-body-2 text-medium-emphasis">{{ t('contact.form.addressesHint') }}</p>
          </div>
          <v-btn v-if="!readOnlyMode" prepend-icon="mdi-map-marker-plus-outline" color="primary" @click="addAddress">
            {{ t('contact.form.addAddress') }}
          </v-btn>
        </div>

        <v-card v-for="(address, index) in form.addresses as IContactAddress[]" :key="index" class="mb-3" rounded="lg" elevation="1">
          <v-card-title class="contact-form__section-title">
            <v-icon color="primary" icon="mdi-map-marker-outline" />
            {{ address.formattedValue || `${t('contact.form.address')} ${index + 1}` }}
            <v-chip v-if="address.primary" color="primary" variant="tonal" size="x-small">{{ t('contact.form.primary') }}</v-chip>
            <v-spacer />
            <v-btn v-if="!readOnlyMode" icon="mdi-delete-outline" color="error" variant="text" size="small" @click="removeItem(form.addresses, index)" />
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="8">
                <label class="contact-form__label">{{ t('contact.form.streetAddress') }}</label>
                <v-text-field v-model="address.streetAddress" :readonly="readOnlyMode" variant="solo-filled" flat hide-details />
              </v-col>
              <v-col cols="12" md="4">
                <label class="contact-form__label">{{ t('contact.form.addressType') }}</label>
                <v-select v-model="address.type" :readonly="readOnlyMode" :items="addressTypes" variant="solo-filled" flat hide-details />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <label class="contact-form__label">{{ t('contact.form.city') }}</label>
                <v-text-field v-model="address.city" :readonly="readOnlyMode" variant="solo-filled" flat hide-details />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <label class="contact-form__label">{{ t('contact.form.region') }}</label>
                <v-text-field v-model="address.region" :readonly="readOnlyMode" variant="solo-filled" flat hide-details />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <label class="contact-form__label">{{ t('contact.form.postalCode') }}</label>
                <v-text-field v-model="address.postalCode" :readonly="readOnlyMode" variant="solo-filled" flat hide-details />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <label class="contact-form__label">{{ t('contact.form.country') }}</label>
                <v-text-field v-model="address.country" :readonly="readOnlyMode" variant="solo-filled" flat hide-details />
              </v-col>
              <v-col cols="12" class="d-flex align-center ga-2">
                <v-switch
                  :model-value="!!address.primary"
                  :disabled="readOnlyMode"
                  color="primary"
                  hide-details
                  density="compact"
                  :label="t('contact.form.primaryAddress')"
                  @update:model-value="value => value && setPrimary(form.addresses, index)"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-empty-state v-if="!form.addresses.length" icon="mdi-map-marker-off-outline" :title="t('contact.form.noAddresses')" />
      </v-tabs-window-item>

      <v-tabs-window-item value="more">
        <v-row>
          <v-col cols="12" lg="8">
            <v-card class="mb-4" rounded="lg" elevation="1">
              <v-card-title class="contact-form__section-title">
                <v-icon color="primary" icon="mdi-cake-variant-outline" />
                {{ t('contact.form.birthday') }}
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-row dense>
                  <v-col cols="4">
                    <label class="contact-form__label">{{ t('contact.form.day') }}</label>
                    <v-text-field v-model.number="form.birthday.day" :readonly="readOnlyMode" type="number" min="1" max="31" variant="solo-filled" flat hide-details />
                  </v-col>
                  <v-col cols="4">
                    <label class="contact-form__label">{{ t('contact.form.monthLabel') }}</label>
                    <v-select v-model="form.birthday.month" :readonly="readOnlyMode" :items="monthItems" variant="solo-filled" flat hide-details />
                  </v-col>
                  <v-col cols="4">
                    <label class="contact-form__label">{{ t('contact.form.year') }}</label>
                    <v-text-field v-model.number="form.birthday.year" :readonly="readOnlyMode" type="number" min="1900" :max="new Date().getFullYear()" variant="solo-filled" flat hide-details />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card class="mb-4" rounded="lg" elevation="1">
              <v-card-title class="contact-form__section-title">
                <v-icon color="primary" icon="mdi-tag-multiple-outline" />
                {{ t('contact.form.tags') }}
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-combobox
                  v-model="form.tags"
                  :readonly="readOnlyMode"
                  multiple
                  chips
                  closable-chips
                  :placeholder="t('contact.form.tagsPlaceholder')"
                  variant="solo-filled"
                  flat
                  hide-details
                />
              </v-card-text>
            </v-card>

            <v-card rounded="lg" elevation="1">
              <v-card-title class="contact-form__section-title">
                <v-icon color="primary" icon="mdi-note-text-outline" />
                {{ t('contact.form.notes') }}
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-textarea v-model="form.notes" :readonly="readOnlyMode" :placeholder="t('contact.form.notesPlaceholder')" rows="5" variant="solo-filled" flat hide-details />
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4">
            <v-card rounded="lg" elevation="1">
              <v-card-title class="contact-form__section-title">
                <v-icon color="primary" icon="mdi-cloud-sync-outline" />
                {{ t('contact.form.syncMetadata') }}
              </v-card-title>
              <v-divider />
              <v-card-text class="d-flex flex-column ga-3">
                <div>
                  <label class="contact-form__label">{{ t('contact.form.statusLabel') }}</label>
                  <v-select v-model="form.status" :readonly="readOnlyMode" :items="statusItems" variant="solo-filled" flat hide-details />
                </div>
                <div>
                  <label class="contact-form__label">{{ t('contact.form.source') }}</label>
                  <v-select v-model="form.source" :readonly="readOnlyMode" :items="sourceItems" variant="solo-filled" flat hide-details />
                </div>
                <div>
                  <label class="contact-form__label">{{ t('contact.form.externalProvider') }}</label>
                  <v-text-field v-model="form.externalProvider" :readonly="readOnlyMode" variant="solo-filled" flat hide-details />
                </div>
                <div>
                  <label class="contact-form__label">{{ t('contact.form.externalId') }}</label>
                  <v-text-field v-model="form.externalId" :readonly="readOnlyMode" variant="solo-filled" flat hide-details />
                </div>
                <div class="contact-form__meta pa-3 rounded-lg">
                  <span class="text-caption text-medium-emphasis">{{ t('contact.form.lastSync') }}</span>
                  <div class="text-body-2 font-weight-medium mt-1">{{ formatSyncDate(form.lastSyncedAt) }}</div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>

    <div class="contact-form__actions d-flex align-center justify-end ga-2 mt-5 pa-3">
      <v-btn variant="text" @click="onCancel">
        {{ readOnlyMode && !isDelete ? t('action.close') : t('action.cancel') }}
      </v-btn>
      <v-btn
        v-if="props.operation !== 'view'"
        :color="isDelete ? 'error' : 'primary'"
        :prepend-icon="isDelete ? 'mdi-delete-outline' : 'mdi-content-save-outline'"
        :loading="loading"
        variant="flat"
        @click="submit"
      >
        {{ isDelete ? t('contact.form.delete') : t('contact.form.save') }}
      </v-btn>
    </div>
  </v-form>
</template>

<style scoped>
.contact-form {
  --contact-text: rgb(var(--v-theme-on-surface));
  --contact-text-muted: rgba(var(--v-theme-on-surface), 0.72);
  --contact-border: rgba(var(--v-theme-on-surface), 0.14);
  --contact-surface-soft: rgba(var(--v-theme-primary), 0.09);
  --contact-control-surface: rgba(var(--v-theme-on-surface), 0.065);
  max-width: 1360px;
  margin: 0 auto;
  padding: 4px;
  color: var(--contact-text);
}

.min-width-0 {
  min-width: 0;
}

.contact-form__profile {
  overflow: hidden;
  color: var(--contact-text);
  background: linear-gradient(135deg, rgb(var(--v-theme-surface)) 65%, rgba(var(--v-theme-primary), 0.08));
  border: 1px solid var(--contact-border);
}

.contact-form__avatar-wrap {
  position: relative;
  cursor: pointer;
}

.contact-form__camera {
  position: absolute;
  right: -2px;
  bottom: 0;
}

.contact-form__label {
  display: block;
  margin-bottom: 5px;
  color: var(--contact-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}


.contact-form__tabs {
  border: 1px solid var(--contact-border);
  border-radius: 12px;
  padding: 4px;
  color: var(--contact-text);
  background: var(--contact-control-surface);
}

.contact-form__tabs :deep(.v-tab:not(.v-tab--selected)) {
  color: var(--contact-text-muted) !important;
  opacity: 1;
}

.contact-form__tabs :deep(.v-tab--selected) {
  color: rgb(var(--v-theme-primary)) !important;
}

.contact-form__tabs :deep(.v-chip) {
  color: var(--contact-text);
  background: var(--contact-control-surface);
}

.contact-form__section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 58px;
  color: var(--contact-text);
  font-size: 1rem;
  font-weight: 700;
}

.contact-form__channel,
.contact-form__meta {
  min-height: 52px;
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  border-radius: 9px;
  color: var(--contact-text);
  background: var(--contact-surface-soft);
  padding: 6px 8px;
}

.contact-form__type-select {
  flex: 0 0 126px;
  max-width: 126px;
}

.contact-form__actions {
  position: sticky;
  z-index: 5;
  bottom: -24px;
  margin-inline: -4px;
  border-top: 1px solid var(--contact-border);
  color: var(--contact-text);
  background: rgba(var(--v-theme-surface), 0.94);
  backdrop-filter: blur(12px);
}

@media (max-width: 600px) {
  .contact-form {
    padding: 0;
  }

  .contact-form__heading {
    display: none !important;
  }

  .contact-form__profile :deep(.v-card-text) {
    padding: 18px;
  }

  .contact-form__tabs :deep(.v-btn) {
    min-width: 0;
    padding-inline: 8px;
    font-size: 0.75rem;
  }

  .contact-form__channel {
    display: grid !important;
    grid-template-columns: 36px minmax(0, 1fr) 32px;
    gap: 4px !important;
  }

  .contact-form__channel .contact-form__type-select {
    grid-column: 2;
    grid-row: 1;
    max-width: 110px;
  }

  .contact-form__channel :deep(.v-text-field) {
    grid-column: 2;
    grid-row: 2;
  }

  .contact-form__channel > :first-child {
    grid-column: 1;
    grid-row: 1 / 3;
  }

  .contact-form__channel > :last-child:not(.contact-form__type-select) {
    grid-column: 3;
    grid-row: 1 / 3;
  }

  .contact-form__actions {
    bottom: -24px;
  }
}
</style>
