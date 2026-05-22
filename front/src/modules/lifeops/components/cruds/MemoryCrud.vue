
<script setup lang="ts">
import MemoryCrud from '../../cruds/MemoryCrud'
import {Crud} from "@drax/crud-vue";
import MemoryTypeCombobox from "@/modules/lifeops/comboboxes/MemoryTypeCombobox.vue";
import SourceCombobox from "@/modules/lifeops/comboboxes/SourceCombobox.vue";
import PriorityCombobox from "@/modules/lifeops/comboboxes/PriorityCombobox.vue";
import LifeAreaCombobox from "@/modules/lifeops/comboboxes/LifeAreaCombobox.vue";

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


    <template v-slot:field.source="{field, form}">
      <source-combobox
          v-model="form.source"
          :name="field.name"
          :label="field.label"
          item-title="name"
          item-value="name"
      />
    </template>

    <template v-slot:field.lifeArea="{field, form}">
      <life-area-combobox
        v-model="form.lifeArea"
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

  </crud>
</template>

<style scoped>

</style>
