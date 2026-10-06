<script setup lang="ts">
import {useMenu} from '../../composables/useMenu'
import {nextTick, onBeforeUnmount, onMounted, onUpdated, PropType, ref, watch} from "vue";
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

const {isGranted, childrenGranted, hasChildrenGranted, itemText} = useMenu()

const props = defineProps({
  menu: {
    type: Array as PropType<IMenuItemCompact[]>,
    required: true
  }
});

const storageKey = 'drax-gallery-menu-compact-state'
const expandedItems = ref<Record<string, boolean>>({});

const masonryGrid = ref<HTMLElement | null>(null)
const observedCards = new Set<HTMLElement>()
const masonryGap = 8
let resizeObserver: ResizeObserver | undefined

const updateMasonryItem = (card: HTMLElement) => {
  const item = card.parentElement
  if (!item?.classList.contains('gallery-compact-layout__item')) return

  item.style.gridRowEnd = `span ${Math.max(1, Math.ceil(card.getBoundingClientRect().height + masonryGap))}`
}

const syncMasonryItems = () => {
  if (!masonryGrid.value || !resizeObserver) return

  const currentCards = new Set(
    Array.from(masonryGrid.value.querySelectorAll<HTMLElement>(':scope > .gallery-compact-layout__item > .v-card'))
  )

  observedCards.forEach(card => {
    if (!currentCards.has(card)) {
      resizeObserver?.unobserve(card)
      observedCards.delete(card)
    }
  })

  currentCards.forEach(card => {
    updateMasonryItem(card)
    if (!observedCards.has(card)) {
      resizeObserver?.observe(card)
      observedCards.add(card)
    }
  })
}

onMounted(() => {
  resizeObserver = new ResizeObserver(entries => {
    entries.forEach(entry => updateMasonryItem(entry.target as HTMLElement))
  })

  const savedState = localStorage.getItem(storageKey);
  if (savedState) {
    try {
      expandedItems.value = JSON.parse(savedState);
    } catch {
      // do nothing
    }
  }

  // Default all parent sections to expanded if not saved
  props.menu.forEach(item => {
    if (expandedItems.value[item.text] === undefined) {
      expandedItems.value[item.text] = true;
    }
  });

  nextTick(syncMasonryItems)
});

onUpdated(() => {
  nextTick(syncMasonryItems)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  observedCards.clear()
})

watch(expandedItems, (newVal) => {
  localStorage.setItem(storageKey, JSON.stringify(newVal));
}, { deep: true });

const toggleItem = (text: string) => {
  expandedItems.value[text] = !expandedItems.value[text];
};
</script>

<template>
  <v-container fluid class="pa-2 pa-sm-3">
    <div ref="masonryGrid" class="gallery-compact-layout">
      <template v-for="(item) in menu" :key="item.text">

        <div
          v-if="item.gallery && isGranted(item) && item.children && hasChildrenGranted(item.children)"
          :key="item.text"
          class="gallery-compact-layout__item"
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
        </div>

        <div
          v-else-if="isGranted(item) && item.gallery && !item.children"
          :key="'e'+item.text"
          class="gallery-compact-layout__item"
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
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-flow: dense;
  grid-auto-rows: 1px;
  column-gap: 8px;
}

.gallery-compact-layout__item {
  min-width: 0;
  padding-bottom: 8px;
}

.gallery-compact-layout__item > .v-card {
  width: 100%;
}

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

@media (min-width: 600px) {
  .gallery-compact-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .gallery-compact-layout {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1904px) {
  .gallery-compact-layout {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .gallery-compact-card-grid {
    grid-template-columns: repeat(auto-fit, minmax(142px, 1fr));
  }
}

</style>
