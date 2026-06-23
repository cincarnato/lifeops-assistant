<script setup lang="ts">
import {useMenu} from '../../composables/useMenu'
import {PropType, ref, onMounted, watch, type CSSProperties} from "vue";
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

const cardTrackWidth = 164
const layoutGap = 8
const maxSectionSpan = 6

const grantedChildren = (item: IMenuItemCompact) => {
  return childrenGranted.value(item.children ?? []) as IMenuItemCompact[]
}

const sectionLayoutStyle = (item: IMenuItemCompact): CSSProperties => {
  const childCount = grantedChildren(item).length
  const span = Math.min(Math.max(childCount, 1), maxSectionSpan)
  const basis = (span * cardTrackWidth) + ((span - 1) * layoutGap)

  return {
    '--gallery-compact-section-basis': `${basis}px`,
    '--gallery-compact-section-grow': String(span)
  } as CSSProperties
}

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
    <div class="gallery-compact-layout">
      <template v-for="(item) in menu" :key="item.text">

        <div
          v-if="item.gallery && isGranted(item) && item.children && hasChildrenGranted(item.children)"
          :key="item.text"
          class="gallery-compact-layout__section"
          :style="sectionLayoutStyle(item)"
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
                      v-for="child in grantedChildren(item)"
                      :key="child.text"
                    >
                      <v-card :to="child.link" class="gallery-compact-card" variant="tonal">
                        <div class="d-flex align-center pa-2">
                          <v-avatar color="primary" variant="flat" size="28" class="mr-2 flex-shrink-0">
                            <v-icon :icon="child.icon" size="17"></v-icon>
                          </v-avatar>
                          <div class="text-caption font-weight-medium text-truncate min-width-0">
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
        </div>

        <div
          v-else-if="isGranted(item) && item.gallery && !item.children"
          :key="'e'+item.text"
          class="gallery-compact-layout__single"
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
        </div>

      </template>
    </div>
  </v-container>
</template>


<style scoped>
.gallery-compact-layout {
  --gallery-compact-track: 164px;

  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: start;
}

.gallery-compact-layout__section {
  flex: var(--gallery-compact-section-grow) 1 min(100%, var(--gallery-compact-section-basis));
  min-width: min(100%, var(--gallery-compact-track));
}

.gallery-compact-layout__single {
  flex: 1 1 var(--gallery-compact-track);
  max-width: 320px;
}

.gallery-compact-section {
  border-radius: 8px;
  height: 100%;
}

.gallery-compact-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--gallery-compact-track), 1fr));
  gap: 6px;
}

.gallery-compact-card {
  border-radius: 6px;
  min-height: 44px;
}

.gallery-compact-card :deep(.v-card__overlay) {
  border-radius: inherit;
}

@media (max-width: 599px) {
  .gallery-compact-layout {
    --gallery-compact-track: 142px;
  }

  .gallery-compact-layout__section,
  .gallery-compact-layout__single {
    flex-basis: 100%;
    max-width: none;
  }
}

</style>
