
<script setup lang="ts">
import MemoryCrud from '../../cruds/MemoryCrud'
import {Crud} from "@drax/crud-vue";
import MemoryTypeCombobox from "@/modules/lifeops/comboboxes/MemoryTypeCombobox.vue";

</script>

<template>
  <crud :entity="MemoryCrud.instance">
    <template v-slot:item.tags="{value}"><v-chip v-for="v in value">{{v}}</v-chip></template>

    <template v-slot:field.type="{field, form}">
      <memory-type-combobox
        v-model="form.type"
        :name="field.name"
        :label="field.label"
        item-title="name"
        item-value="name"
      />
    </template>

  </crud>
</template>

<style scoped>

</style>
