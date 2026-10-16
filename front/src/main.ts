import App from './App.vue'
import indexI18n from "@/i18n/index-I18n";
import vuetify from "@/plugins/vuetify";
import router from "@/router/index-routes";
import pinia from "@/stores";
import { createApp } from 'vue'
import {setupAuth} from "./setup/SetupAuth";
import setupSetting from "./setup/SetupSetting";
import SetupEntities from "./setup/SetupEntities";

async function bootstrap() {
  const app = createApp(App)

  app.use(pinia)
  await setupAuth()

  setupSetting().then(() => {console.log("Setting Setup Done")})
  SetupEntities()

  app
    .use(vuetify)
    .use(router)
    .use(indexI18n)

  app.mount('#app')
}

void bootstrap()
