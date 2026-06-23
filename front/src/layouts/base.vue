<script lang="ts" setup>
import { useAuth} from "@drax/identity-vue";
import { useSettingStore} from "@drax/settings-vue";
import DarkMode from "../components/DarkMode/index.vue";
import {useRouter} from "vue-router";
import { useDarkMode } from '../composables/useDarkMode.js'
import logoJarvops from '@/assets/jarvops_120.png'

const {loadDarkMode} = useDarkMode()

onMounted(() => {
  loadDarkMode()
})


const {push} = useRouter()

const {isAuthenticated} = useAuth()


const appName = computed(() => {
  const settingStore = useSettingStore()
  return settingStore.getSettingValueByKey('STRING')
})

</script>

<template>
  <v-app>

    <v-app-bar density="compact" v-if="isAuthenticated()" >
      <slot name="toolbar-left">
        <v-btn icon @click="push({name:'HomePage'})">
          <v-img :src="logoJarvops" width="28" height="28" alt="LifeOps" />
        </v-btn>
        {{appName}}
      </slot>
      <v-spacer></v-spacer>
      <slot name="toolbar-right"></slot>
      <dark-mode></dark-mode>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>

  </v-app>
</template>

<style scoped>
:deep(.v-btn .v-img) {
  flex: 0 0 auto;
}
</style>

