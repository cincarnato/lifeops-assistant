<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import logoJarvops from '@/assets/jarvops_120.png'

const {t} = useI18n()

const features = [
  {
    icon: 'mdi-checkbox-marked-circle-outline',
    titleKey: 'landing.features.planning.title',
    textKey: 'landing.features.planning.text',
  },
  {
    icon: 'mdi-brain',
    titleKey: 'landing.features.memory.title',
    textKey: 'landing.features.memory.text',
  },
  {
    icon: 'mdi-calendar-sync-outline',
    titleKey: 'landing.features.integrations.title',
    textKey: 'landing.features.integrations.text',
  },
]
</script>

<template>
  <div class="landing-page">
    <div class="landing-login">
      <v-btn
        :to="{name: 'Login'}"
        color="primary"
        prepend-icon="mdi-login"
        rounded="lg"
        variant="flat"
      >
        {{ t('landing.actions.login') }}
      </v-btn>
    </div>

    <v-container class="landing-page__container">
      <v-row align="center" class="landing-page__hero" justify="center">
        <v-col cols="12" lg="6">
          <div class="d-flex align-center ga-3 mb-8">
            <v-img
              :src="logoJarvops"
              alt="JarvOps"
              class="landing-page__logo"
              eager
            />
            <div>
              <p class="text-overline text-primary mb-1">{{ t('landing.brand.kicker') }}</p>
              <p class="text-h5 font-weight-bold mb-0">{{ t('landing.brand.name') }}</p>
            </div>
          </div>

          <h1 class="landing-page__title font-weight-bold mb-5">
            {{ t('landing.hero.title') }}
          </h1>

          <p class="text-h6 text-medium-emphasis mb-8 landing-page__subtitle">
            {{ t('landing.hero.subtitle') }}
          </p>

          <div class="d-flex flex-wrap ga-3 mb-8">
            <v-btn
              :to="{name: 'Login'}"
              color="primary"
              prepend-icon="mdi-rocket-launch-outline"
              size="large"
              rounded="lg"
            >
              {{ t('landing.actions.start') }}
            </v-btn>
            <v-btn
              :to="{name: 'PoliticaPrivacidad'}"
              prepend-icon="mdi-shield-lock-outline"
              size="large"
              rounded="lg"
              variant="tonal"
            >
              {{ t('landing.actions.privacy') }}
            </v-btn>
          </div>

          <div class="d-flex flex-wrap ga-2">
            <v-chip prepend-icon="mdi-google" variant="tonal">
              {{ t('landing.badges.google') }}
            </v-chip>
            <v-chip prepend-icon="mdi-robot-outline" variant="tonal">
              {{ t('landing.badges.ai') }}
            </v-chip>
            <v-chip prepend-icon="mdi-lock-outline" variant="tonal">
              {{ t('landing.badges.private') }}
            </v-chip>
          </div>
        </v-col>

        <v-col cols="12" lg="5">
          <div class="landing-page__panel">
            <div class="d-flex align-center justify-space-between mb-5">
              <div>
                <p class="text-overline text-medium-emphasis mb-1">{{ t('landing.panel.kicker') }}</p>
                <h2 class="text-h5 font-weight-bold mb-0">{{ t('landing.panel.title') }}</h2>
              </div>
              <v-icon color="primary" icon="mdi-view-dashboard-outline" size="32" />
            </div>

            <v-list bg-color="transparent" class="pa-0">
              <v-list-item
                v-for="feature in features"
                :key="feature.titleKey"
                class="landing-page__feature px-0"
              >
                <template #prepend>
                  <v-avatar color="primary" variant="tonal">
                    <v-icon :icon="feature.icon" />
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">
                  {{ t(feature.titleKey) }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-wrap">
                  {{ t(feature.textKey) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </div>
        </v-col>
      </v-row>

      <v-divider class="my-10" />

      <v-row class="pb-10" justify="center">
        <v-col cols="12" md="10">
          <div class="d-flex flex-wrap align-center justify-center ga-4 text-body-2 text-medium-emphasis">
            <span>{{ t('landing.legal.label') }}</span>
            <router-link :to="{name: 'CondicionesServicio'}" class="landing-page__link">
              {{ t('landing.actions.terms') }}
            </router-link>
            <router-link :to="{name: 'PoliticaPrivacidad'}" class="landing-page__link">
              {{ t('landing.actions.privacy') }}
            </router-link>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100%;
  overflow: hidden;
  position: relative;
}

.landing-login {
  position: fixed;
  right: 24px;
  top: 20px;
  z-index: 20;
}

.landing-page__container {
  max-width: 1180px;
  padding-top: 92px;
}

.landing-page__hero {
  min-height: calc(100vh - 170px);
}

.landing-page__logo {
  flex: 0 0 auto;
  height: 56px;
  width: 56px;
}

.landing-page__title {
  font-size: 4.75rem;
  letter-spacing: 0;
  line-height: 1;
  max-width: 820px;
}

.landing-page__subtitle {
  line-height: 1.5;
  max-width: 680px;
}

.landing-page__panel {
  background: rgba(var(--v-theme-surface), 0.78);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
  padding: 28px;
}

.landing-page__feature {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  min-height: 92px;
}

.landing-page__feature:last-child {
  border-bottom: 0;
}

.landing-page__link {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  text-decoration: none;
}

.landing-page__link:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .landing-login {
    right: 16px;
    top: 14px;
  }

  .landing-page__container {
    padding-top: 84px;
  }

  .landing-page__panel {
    padding: 20px;
  }

  .landing-page__title {
    font-size: 2.6rem;
  }
}

@media (min-width: 601px) and (max-width: 960px) {
  .landing-page__title {
    font-size: 3.5rem;
  }
}
</style>
