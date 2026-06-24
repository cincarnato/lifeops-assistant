
<script setup lang="ts">
import DayPlanCrud from '../../cruds/DayPlanCrud'
import {Crud} from "@drax/crud-vue";
import {useCrud} from "@drax/crud-vue";
import CrudForm from "@drax/crud-vue/src/components/CrudForm.vue";
import {formatDate} from "@drax/common-front"
import {ref} from "vue";
import DayPlanProvider from "../../providers/DayPlanProvider";
import DayPlan from "../DayPlan.vue";


const {doPaginate} = useCrud(DayPlanCrud.instance)
const generating = ref(false)

async function generateToday() {
  generating.value = true
  try {
    await DayPlanProvider.instance.generateToday()
    await doPaginate()
  } finally {
    generating.value = false
  }
}
</script>

<template>
  <crud :entity="DayPlanCrud.instance">
    <template v-slot:form="{operation, form}">
          <day-plan :item="form" :operation="operation"/>
    </template>

    <template v-slot:toolbar-left>
      <v-btn
        icon="mdi-calendar-sync-outline"
        variant="text"
        :loading="generating"
        :disabled="generating"
        @click="generateToday"
      />
    </template>
    <template v-slot:item.date="{value}">{{formatDate(value)}}</template>
    <template v-slot:item.user="{value}">{{value?.username}}</template>
  </crud>
</template>

<style scoped>

</style>
