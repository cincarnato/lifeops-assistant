
<script setup lang="ts">
import CompanyCrud from '../../cruds/CompanyCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"
import CompanyTypeCombobox from '../../comboboxes/CompanyTypeCombobox.vue'

</script>

<template>
  <crud :entity="CompanyCrud.instance">
    <template v-slot:field.type="{field, form}">
      <company-type-combobox
          v-model="form.type"
          :name="field.name"
          :label="field.label"
          item-title="name"
          item-value="name"
      />
    </template>
    <template v-slot:item.type="{value}">{{value}}</template>
    <template v-slot:item.emailDomains="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.archivedAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>

</style>
