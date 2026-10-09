<script setup lang="ts">
import ProjectCrud from '../../cruds/ProjectCrud'
import {Crud} from '@drax/crud-vue'
import PriorityCombobox from '../../comboboxes/PriorityCombobox.vue'
</script>

<template>
  <crud :entity="ProjectCrud.instance">
    <template #field.priority="{field, form}">
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
        <v-icon icon="mdi-folder-outline" color="primary" size="20" />
        <span class="font-weight-medium">{{ value || '—' }}</span>
      </div>
    </template>
    <template #item.aliases="{value}">
      <div v-if="value?.length" class="d-flex flex-wrap ga-1 py-2">
        <v-chip v-for="alias in value" :key="alias" size="small" variant="outlined">{{ alias }}</v-chip>
      </div>
      <span v-else class="text-medium-emphasis">—</span>
    </template>
    <template #item.priority="{value}">
      <v-chip v-if="value" color="primary" size="small" variant="tonal" prepend-icon="mdi-flag-outline">{{ value }}</v-chip>
      <span v-else class="text-medium-emphasis">—</span>
    </template>
    <template #item.businessPartner="{value}">
      <v-chip v-if="value?.name" color="secondary" size="small" variant="tonal" prepend-icon="mdi-domain">{{ value.name }}</v-chip>
      <span v-else class="text-medium-emphasis">—</span>
    </template>
    <template #item.redmineProjectId="{value}">
      <v-chip v-if="value" color="error" size="small" variant="outlined" prepend-icon="mdi-source-repository">{{ value }}</v-chip>
      <span v-else class="text-medium-emphasis">—</span>
    </template>
    <template #item.tags="{value}">
      <div v-if="value?.length" class="d-flex flex-wrap ga-1 py-2">
        <v-chip v-for="tag in value" :key="tag" color="info" size="small" variant="tonal" prepend-icon="mdi-tag-outline">{{ tag }}</v-chip>
      </div>
      <span v-else class="text-medium-emphasis">—</span>
    </template>
  </crud>
</template>
