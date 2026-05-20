<script lang="ts" setup>
import DarkMode from "../components/DarkMode/index.vue";
import logoLifeops from '@/assets/logo-lifeops.png'


</script>

<template>
  <v-app>

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

