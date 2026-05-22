
<script setup lang="ts">
import ClientCrud from '../../cruds/ClientCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import PriorityCombobox from '../../comboboxes/PriorityCombobox.vue'
import ClientTypeCombobox from '../../comboboxes/ClientTypeCombobox.vue'
import {useI18n} from "vue-i18n";

const {t,te} = useI18n()

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
  <crud :entity="ClientCrud.instance">
    <template v-slot:field.taxCondition="{field, form}">
      <v-select
          v-model="form.taxCondition"
          :name="field.name"
          :label="t('client.field.taxCondition')"
          :items="taxConditions"
          clearable
          variant="outlined"
      />
    </template>

    <template v-slot:field.taxIdType="{field, form}">
      <v-select
        v-model="form.taxIdType"
        :name="field.name"
        :label="t('client.field.taxIdType')"
        :items="taxIdTypes"
        clearable
        variant="outlined"
      />
    </template>

    <template v-slot:field.type="{field, form}">
      <client-type-combobox
          v-model="form.type"
          :name="field.name"
          :label="field.label"
          item-title="name"
          item-value="name"
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




    <template v-slot:item.type="{value}">{{value}}</template>
    <template v-slot:item.priority="{value}">{{value}}</template>
    <template v-slot:item.emailDomains="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.mainContact="{value}">{{value?.displayName}}</template>
    <template v-slot:item.company="{value}">{{value?.name}}</template>
    <template v-slot:item.redmineProjectIds="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.archivedAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>
