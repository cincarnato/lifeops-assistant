<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import menu from '../menu'
import {IdentityProfileAvatar, IdentityProfileDrawer, useAuth} from "@drax/identity-vue";
import {useSettingStore} from "@drax/settings-vue";
import DarkMode from "../components/DarkMode/index.vue";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu.vue";
import {useRouter} from "vue-router";
import { useDarkMode } from '../composables/useDarkMode.js'
import NotificationButton from "../modules/base/components/NotificationButton.vue"
import { DraxAgentButton} from "@drax/ai-vue";
import logoJarvops from '@/assets/jarvops_120.png'

const {loadDarkMode} = useDarkMode()

onMounted(() => {
  loadDarkMode()
})


let profileDrawer = ref(false)
let drawer = ref(false)

const {push} = useRouter()
const settingStore = useSettingStore()

const {isAuthenticated} = useAuth()

const appName = computed(() => {
  return settingStore.getSettingValueByKey('AppName')
})
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <sidebar-menu :menu="menu"></sidebar-menu>
    </v-navigation-drawer>
    <v-app-bar v-if="isAuthenticated()" >
      <v-app-bar-nav-icon v-model="menu" @click="drawer=!drawer"/>
      <slot name="toolbar-left">
        <v-btn icon @click="push({name:'Home'})">
          <v-img :src="logoJarvops" width="28" height="28" alt="LifeOps" />
        </v-btn>
       <v-app-bar-title> {{appName}}</v-app-bar-title>
      </slot>
      <v-spacer></v-spacer>
      <slot name="toolbar-right"></slot>
      <dark-mode></dark-mode>
      <drax-agent-button></drax-agent-button>


      <notification-button class="mr-2"></notification-button>
      <identity-profile-avatar class="cursor-pointer" @click="profileDrawer = !profileDrawer"></identity-profile-avatar>
    </v-app-bar>

    <identity-profile-drawer v-if="isAuthenticated()" v-model="profileDrawer" ></identity-profile-drawer>




    <v-main>
      <router-view/>
    </v-main>

    <v-footer v-if="!isAuthenticated()" class="default-layout__public-footer">
      <div class="default-layout__public-footer-content">
        <router-link :to="{ name: 'CondicionesServicio' }" class="default-layout__public-footer-link">
          Condiciones de servicio
        </router-link>
        <span class="default-layout__public-footer-separator">|</span>
        <router-link :to="{ name: 'PoliticaPrivacidad' }" class="default-layout__public-footer-link">
          Política de privacidad
        </router-link>
      </div>
    </v-footer>

  </v-app>
</template>

<style scoped>
.default-layout__chatbot-task {
  height: min(720px, calc(100vh - 160px));
  min-height: 520px;
}

:deep(.v-btn .v-img) {
  flex: 0 0 auto;
}

.default-layout__public-footer {
  background: transparent;
  color: rgba(var(--v-theme-on-background), 0.7);
  justify-content: center;
  min-height: 48px;
  padding-bottom: 16px;
  padding-top: 8px;
}

.default-layout__public-footer-content {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  font-size: 0.875rem;
  gap: 8px;
  justify-content: center;
  line-height: 1.4;
  text-align: center;
}

.default-layout__public-footer-link {
  color: inherit;
  text-decoration: none;
}

.default-layout__public-footer-link:hover {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}

.default-layout__public-footer-separator {
  color: rgba(var(--v-theme-on-background), 0.4);
}

@media (max-width: 700px) {
  .default-layout__chatbot-task {
    height: calc(100vh - 136px);
    min-height: 420px;
  }

  .default-layout__public-footer {
    padding-inline: 16px;
  }
}
</style>
