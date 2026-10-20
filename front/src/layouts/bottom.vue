<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {IdentityProfileAvatar, IdentityProfileDrawer, useAuth} from '@drax/identity-vue'
import {useSettingStore} from '@drax/settings-vue'
import {DraxAgentButton} from '@drax/ai-vue'
import menu from '../menu'
import DarkMode from '../components/DarkMode/index.vue'
import SidebarMenu from '../components/SidebarMenu/SidebarMenu.vue'
import {useDarkMode} from '../composables/useDarkMode.js'
import logoJarvops from '@/assets/jarvops_120.png'

const {loadDarkMode} = useDarkMode()
onMounted(loadDarkMode)

const drawer = ref(false)
const profileDrawer = ref(false)
const {push} = useRouter()
const {isAuthenticated} = useAuth()
const settingStore = useSettingStore()
const appName = computed(() => settingStore.getSettingValueByKey('AppName'))
</script>

<template>
  <v-app>
    <v-navigation-drawer v-if="isAuthenticated()" v-model="drawer" temporary>
      <sidebar-menu :menu="menu" />
    </v-navigation-drawer>
    <identity-profile-drawer v-if="isAuthenticated()" v-model="profileDrawer" />

    <v-main class="bottom-layout__main">
      <router-view />
    </v-main>

    <v-footer v-if="isAuthenticated()" class="pa-0 flex-grow-0">
      <v-toolbar density="compact">
        <v-app-bar-nav-icon @click="drawer = !drawer" />
        <slot name="toolbar-left">
          <v-btn icon @click="push({name: 'Home'})">
            <v-img :src="logoJarvops" width="28" height="28" alt="LifeOps" />
          </v-btn>
          <v-toolbar-title>{{ appName }}</v-toolbar-title>
        </slot>
        <v-spacer />
        <slot name="toolbar-right" />
        <dark-mode />
        <drax-agent-button />
        <identity-profile-avatar class="cursor-pointer" @click="profileDrawer = !profileDrawer" />
      </v-toolbar>
    </v-footer>
  </v-app>
</template>

<style scoped>
.bottom-layout__main {
  /* Keep navigation below the first screen, even on short pages. */
  min-height: 100vh;
  min-height: 100dvh;
}

:deep(.v-btn .v-img) {
  flex: 0 0 auto;
}
</style>
