<script setup lang="ts">
import {useMenu} from '../../composables/useMenu'
import {PropType, ref, onMounted, watch} from "vue";
import type {IMenuItem} from "@drax/common-share";

type MenuColValue = number | string

interface IMenuItemCompact extends IMenuItem{
  description ?: string
  cols?: MenuColValue
  sm?: MenuColValue
  md?: MenuColValue
  lg?: MenuColValue
  xl?: MenuColValue
  children?: IMenuItemCompact[]
}

const {isActive, isGranted, childrenGranted, hasChildrenGranted, itemText} = useMenu()

const props = defineProps({
  menu: {
    type: Array as PropType<IMenuItemCompact[]>,
    required: true
  }
});

const storageKey = 'drax-gallery-menu-compact-state'
const expandedItems = ref<Record<string, boolean>>({});

const defaultSectionCols = {
  cols: 12
}

const defaultCardCols = {
  cols: 6,
  sm: 4,
  md: 3,
  lg: 2,
  xl: 1
}

const buildColProps = (item: IMenuItemCompact, defaults: Record<string, MenuColValue>) => ({
  cols: item.cols ?? defaults.cols,
  sm: item.sm ?? defaults.sm,
  md: item.md ?? defaults.md,
  lg: item.lg ?? defaults.lg,
  xl: item.xl ?? defaults.xl
})

onMounted(() => {
  const savedState = localStorage.getItem(storageKey);
  if (savedState) {
    try {
      expandedItems.value = JSON.parse(savedState);
    } catch(e) {
      // do nothing
    }
  }

  // Default all parent sections to expanded if not saved
  props.menu.forEach(item => {
    if (expandedItems.value[item.text] === undefined) {
      expandedItems.value[item.text] = true;
    }
  });
});

watch(expandedItems, (newVal) => {
  localStorage.setItem(storageKey, JSON.stringify(newVal));
}, { deep: true });

const toggleItem = (text: string) => {
  expandedItems.value[text] = !expandedItems.value[text];
};
</script>

<template>
  <v-container fluid class="pa-3 pa-sm-4">
    <v-row dense>
      <template v-for="(item) in menu" :key="item.text">

        <v-col
          v-if="item.gallery && isGranted(item) && item.children && hasChildrenGranted(item.children)"
          :key="item.text"
          v-bind="buildColProps(item, defaultSectionCols)"
          :value="isActive(item)"
        >
          <v-card class="gallery-compact-section elevation-1 bg-surface">
            <v-card-item class="pa-3 cursor-pointer" @click="toggleItem(item.text)" style="cursor: pointer;">
              <div class="d-flex align-center w-100">
                <v-avatar color="primary" variant="tonal" size="34" class="mr-3">
                  <v-icon :icon="item.icon" size="19"></v-icon>
                </v-avatar>
                <div class="flex-grow-1 min-width-0">
                  <div class="text-subtitle-2 font-weight-bold text-high-emphasis text-truncate">
                    {{ itemText(item) }}
                  </div>
                  <div v-if="item.description" class="text-caption text-medium-emphasis text-truncate">
                    {{ item.description }}
                  </div>
                </div>
                <v-icon
                  :icon="expandedItems[item.text] ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  size="22"
                  class="text-medium-emphasis ml-2"
                ></v-icon>
              </div>
            </v-card-item>

            <v-expand-transition>
              <div v-show="expandedItems[item.text]">
                <v-card-text class="pa-3 pt-0">
                  <div class="gallery-compact-card-grid">
                    <div
                      v-for="child in childrenGranted(item.children) as IMenuItemCompact[]"
                      :key="child.text"
                    >
                      <v-card :to="child.link" class="gallery-compact-card" variant="tonal">
                        <div class="d-flex align-center pa-2">
                          <v-avatar color="primary" variant="flat" size="28" class="mr-2 flex-shrink-0">
                            <v-icon :icon="child.icon" size="17"></v-icon>
                          </v-avatar>
                          <div class="gallery-compact-card__label text-caption font-weight-medium min-width-0">
                            {{ itemText(child) }}
                          </div>
                        </div>
                      </v-card>
                    </div>
                  </div>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-col>

        <v-col
          v-else-if="isGranted(item) && item.gallery && !item.children"
          :key="'e'+item.text"
          v-bind="buildColProps(item, defaultCardCols)"
        >
          <v-card :to="item.link" class="gallery-compact-card" variant="tonal">
            <div class="d-flex align-center pa-2">
              <v-avatar color="primary" variant="flat" size="28" class="mr-2 flex-shrink-0">
                <v-icon :icon="item.icon" size="17"></v-icon>
              </v-avatar>
              <div class="text-caption font-weight-medium text-truncate min-width-0">
                {{ itemText(item) }}
              </div>
            </div>
          </v-card>
        </v-col>

      </template>
    </v-row>
  </v-container>
</template>


<style scoped>
.gallery-compact-section {
  border-radius: 8px;
}

.gallery-compact-card {
  border-radius: 6px;
  min-height: 44px;
}

.gallery-compact-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(164px, 1fr));
  gap: 6px;
}

.gallery-compact-card__label {
  line-height: 1.2;
  white-space: normal;
  overflow-wrap: anywhere;
}

.gallery-compact-card :deep(.v-card__overlay) {
  border-radius: inherit;
}

@media (max-width: 599px) {
  .gallery-compact-card-grid {
    grid-template-columns: repeat(auto-fit, minmax(142px, 1fr));
  }
}

</style>
