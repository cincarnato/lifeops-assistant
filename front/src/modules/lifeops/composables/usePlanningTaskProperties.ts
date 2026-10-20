import {ref, watch} from 'vue'

export const PLANNING_TASK_PROPERTIES_STORAGE_KEY = 'lifeops.dayPlanning.visibleTaskProperties'
export const DEFAULT_PLANNING_TASK_PROPERTIES = ['importance', 'urgent', 'dueDate', 'project'] as const

export const planningTaskProperties = [
  {key: 'priority', icon: 'mdi-flag-outline', group: 'basic'},
  {key: 'importance', icon: 'mdi-format-list-numbered', group: 'basic'},
  {key: 'status', icon: 'mdi-view-column-outline', group: 'basic'},
  {key: 'description', icon: 'mdi-text-box-outline', group: 'basic'},
  {key: 'type', icon: 'mdi-shape-outline', group: 'classification'},
  {key: 'lifeArea', icon: 'mdi-compass-outline', group: 'classification'},
  {key: 'source', icon: 'mdi-source-branch', group: 'classification'},
  {key: 'dueDate', icon: 'mdi-calendar-alert', group: 'dates'},
  {key: 'scheduledDate', icon: 'mdi-calendar-clock', group: 'dates'},
  {key: 'completedAt', icon: 'mdi-check-circle-outline', group: 'dates'},
  {key: 'createdAt', icon: 'mdi-plus-circle-outline', group: 'dates'},
  {key: 'updatedAt', icon: 'mdi-update', group: 'dates'},
  {key: 'archivedAt', icon: 'mdi-archive-outline', group: 'dates'},
  {key: 'project', icon: 'mdi-folder-open-outline', group: 'context'},
  {key: 'goals', icon: 'mdi-bullseye-arrow', group: 'context'},
  {key: 'tags', icon: 'mdi-tag-multiple-outline', group: 'context'},
  {key: 'user', icon: 'mdi-account-circle-outline', group: 'context'},
  {key: 'valueScore', icon: 'mdi-chart-line', group: 'scoring'},
  {key: 'motivationScore', icon: 'mdi-lightning-bolt-outline', group: 'scoring'},
  {key: 'effortScore', icon: 'mdi-weight-lifter', group: 'scoring'},
  {key: 'urgent', icon: 'mdi-alarm', group: 'classification'},
  {key: 'redmineIssueId', icon: 'mdi-ticket-outline', group: 'integrations'},
  {key: 'emailMessageId', icon: 'mdi-email-outline', group: 'integrations'},
  {key: 'calendarEventId', icon: 'mdi-calendar-link', group: 'integrations'},
  {key: 'notes', icon: 'mdi-note-text-outline', group: 'activity'},
  {key: 'statusHistory', icon: 'mdi-history', group: 'activity'}
] as const

export type PlanningTaskPropertyKey = typeof planningTaskProperties[number]['key']
const knownKeys = new Set<string>(planningTaskProperties.map(property => property.key))

export function normalizePlanningTaskProperties(value: unknown): PlanningTaskPropertyKey[] {
  if (!Array.isArray(value)) return [...DEFAULT_PLANNING_TASK_PROPERTIES]
  return [...new Set(value.filter((key): key is PlanningTaskPropertyKey => typeof key === 'string' && knownKeys.has(key)))]
}

export function parsePlanningTaskProperties(value: string | null): PlanningTaskPropertyKey[] {
  try {
    return normalizePlanningTaskProperties(value === null ? undefined : JSON.parse(value))
  } catch {
    return [...DEFAULT_PLANNING_TASK_PROPERTIES]
  }
}

type PropertyStorage = Pick<Storage, 'getItem' | 'setItem'>
export function loadPlanningTaskProperties(storage: PropertyStorage): PlanningTaskPropertyKey[] {
  try {
    return parsePlanningTaskProperties(storage.getItem(PLANNING_TASK_PROPERTIES_STORAGE_KEY))
  } catch {
    return [...DEFAULT_PLANNING_TASK_PROPERTIES]
  }
}

export function savePlanningTaskProperties(storage: PropertyStorage, value: unknown): boolean {
  try {
    storage.setItem(PLANNING_TASK_PROPERTIES_STORAGE_KEY, JSON.stringify(normalizePlanningTaskProperties(value)))
    return true
  } catch {
    return false
  }
}

export function usePlanningTaskProperties() {
  let storage: PropertyStorage | undefined
  try { storage = globalThis.localStorage } catch { /* Storage may be blocked by browser policy. */ }
  const visibleProperties = ref<string[]>(storage ? loadPlanningTaskProperties(storage) : [...DEFAULT_PLANNING_TASK_PROPERTIES])
  watch(visibleProperties, value => {
    if (storage) savePlanningTaskProperties(storage, value)
  }, {deep: true})
  return {visibleProperties}
}

function entityName(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (!value || typeof value !== 'object') return ''
  const entity = value as Record<string, unknown>
  const fullName = [entity.givenName || entity.firstName, entity.familyName || entity.lastName]
    .filter(part => typeof part === 'string' && part.trim()).join(' ')
  for (const candidate of [entity.name, entity.displayName, entity.title, entity.username, entity.email, fullName, entity._id, entity.id]) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  }
  return ''
}

export type PlanningPropertyFormatterOptions = {
  locale: string
  t: (key: string, values?: Record<string, number>) => string
  importanceTitle?: (value: unknown) => string | undefined
}

export function formatPlanningTaskProperty(task: unknown, key: PlanningTaskPropertyKey, options: PlanningPropertyFormatterOptions): string {
  if (!task || typeof task !== 'object') return ''
  const value = (task as Record<string, unknown>)[key]
  if (value === null || value === undefined) return ''
  if (key === 'notes' || key === 'statusHistory') {
    const count = Array.isArray(value)
      ? key === 'notes' ? value.filter(note => typeof note === 'string' ? note.trim() : note && typeof note === 'object' && typeof note.note === 'string' && note.note.trim()).length : value.length
      : key === 'notes' && typeof value === 'string' && value.trim() ? 1 : 0
    return count ? options.t('dayplan.ui.propertyCount', {count}) : ''
  }
  if (typeof value === 'boolean') return options.t(value ? 'dayplan.ui.propertyYes' : 'dayplan.ui.propertyNo')
  if (['dueDate', 'scheduledDate', 'completedAt', 'createdAt', 'updatedAt', 'archivedAt'].includes(key)) {
    if (!(value instanceof Date) && typeof value !== 'string') return ''
    const date = value instanceof Date ? value : new Date(value)
    if (!Number.isFinite(date.getTime())) return ''
    try {
      return new Intl.DateTimeFormat(options.locale, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        ...(['dueDate', 'scheduledDate'].includes(key) ? {timeZone: 'UTC'} : {})
      }).format(date)
    } catch { return '' }
  }
  if (['valueScore', 'motivationScore', 'effortScore'].includes(key)) {
    return typeof value === 'number' && Number.isFinite(value) ? String(Math.round(value)) : ''
  }
  if (key === 'importance') return options.importanceTitle?.(value) || entityName(value)
  if (Array.isArray(value)) return value.map(entityName).filter(Boolean).join(', ')
  return entityName(value)
}
