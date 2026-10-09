
<script setup lang="ts">
import BusinessPartnerCrud from '../../cruds/BusinessPartnerCrud'
import {Crud} from "@drax/crud-vue";

import PriorityCombobox from '../../comboboxes/PriorityCombobox.vue'

import {useI18n} from "vue-i18n";

const {t} = useI18n()

const roleItems = [
  {title: t('businesspartner.role.client'), value: 'client'},
  {title: t('businesspartner.role.provider'), value: 'provider'},
]

const taxIdTypes = [
  "CUIT",
  "CUIL",
  "CDI",
  "LE",
  "LC",
  "CI Extranjera",
  "DNI",
  "Pasaporte",
  "CI Policía Federal",
  "Certificado de Migración"
]

const taxConditions = [
  "IVA Responsable Inscripto",
  "IVA Sujeto Exento",
  "Consumidor Final",
  "Responsable Monotributo",
  "Sujeto No Categorizado",
  "Proveedor del Exterior",
  "Cliente del Exterior",
  "IVA Liberado - Ley Nº 19.640",
  "Monotributista Social",
  "IVA No Alcanzado",
  "Monotributista Trabajador Independiente Promovido"
]

</script>

<template>
  <crud :entity="BusinessPartnerCrud.instance">
    <template v-slot:field.taxCondition="{field, form}">
      <v-select
          v-model="form.taxCondition"
          :name="field.name"
          :label="t('businesspartner.field.taxCondition')"
          :items="taxConditions"
          clearable
          variant="outlined"
      />
    </template>

    <template v-slot:field.taxIdType="{field, form}">
      <v-select
        v-model="form.taxIdType"
        :name="field.name"
        :label="t('businesspartner.field.taxIdType')"
        :items="taxIdTypes"
        clearable
        variant="outlined"
      />
    </template>

    <template v-slot:field.roles="{field, form}">
      <v-select
          v-model="form.roles"
          :name="field.name"
          :label="t('businesspartner.field.roles')"
          :items="roleItems"
          multiple
          chips
          closable-chips
          variant="outlined"
      />
    </template>
    <template v-slot:field.priority="{field, form}">
      <priority-combobox
          v-model="form.priority"
          :name="field.name"
          :label="field.label"
          item-title="name"
          item-value="name"
      />
    </template>




    <template #item.name="{value}">
      <div class="d-flex align-center ga-2 py-2">
        <v-icon icon="mdi-domain" color="primary" size="20" />
        <span class="font-weight-medium">{{ value || '—' }}</span>
      </div>
    </template>
    <template #item.roles="{value}">
      <div v-if="value?.length" class="d-flex flex-wrap ga-1 py-2">
        <v-chip
          v-for="role in value"
          :key="role"
          :color="role === 'client' ? 'success' : 'info'"
          :prepend-icon="role === 'client' ? 'mdi-account-tie-outline' : 'mdi-truck-outline'"
          size="small"
          variant="tonal"
        >{{ t(`businesspartner.role.${role}`) }}</v-chip>
      </div>
      <span v-else class="text-medium-emphasis">—</span>
    </template>
    <template #item.priority="{value}">
      <v-chip v-if="value" color="primary" size="small" variant="tonal" prepend-icon="mdi-flag-outline">{{ value }}</v-chip>
      <span v-else class="text-medium-emphasis">—</span>
    </template>
    <template #item.mainContact="{value}">
      <div v-if="value?.displayName" class="d-flex align-center ga-2">
        <v-avatar color="secondary" variant="tonal" size="28">
          <v-icon icon="mdi-account-outline" size="18" />
        </v-avatar>
        <span>{{ value.displayName }}</span>
      </div>
      <span v-else class="text-medium-emphasis">—</span>
    </template>
  </crud>
</template>

<style scoped>

</style>
