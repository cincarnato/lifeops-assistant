
<script setup lang="ts">
import ContactCrud from '../../cruds/ContactCrud'
import {Crud} from "@drax/crud-vue";
import {formatDate} from "@drax/common-front"

function chipValue(item: any) {
  return typeof item === 'string' ? item : item?.value
}
</script>

<template>
  <crud :entity="ContactCrud.instance">
    <template v-slot:item.source="{value}">
      <v-chip size="x-small" variant="tonal">{{value}}</v-chip>
    </template>
    <template v-slot:item.status="{value}">
      <v-chip size="x-small" variant="tonal">{{value}}</v-chip>
    </template>
    <template v-slot:item.emails="{value}">
      <div class="contact-chip-list">
        <v-chip
            v-for="v in value"
            :key="chipValue(v)"
            size="x-small"
            variant="tonal"
        >
          {{ chipValue(v) }}
        </v-chip>
      </div>
    </template>
    <template v-slot:item.phones="{value}">
      <div class="contact-chip-list">
        <v-chip
            v-for="v in value"
            :key="chipValue(v)"
            size="x-small"
            variant="tonal"
        >
          {{ chipValue(v) }}
        </v-chip>
      </div>
    </template>
    <template v-slot:item.organization="{value}">
      {{ [value?.name, value?.title].filter(Boolean).join(' - ') }}
    </template>
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
    <template v-slot:item.lastSyncedAt="{value}">{{formatDate(value)}}</template>
  </crud>
</template>

<style scoped>
.contact-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 240px;
}
</style>
