import {computed, onBeforeUnmount, reactive, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAuth} from '@drax/identity-vue'
import {centerEntities, centerFilters, centerMetrics, currentPeriod, referenceId, valueAt} from './commandCenter'
import AgentJobExecutionProvider from '../../providers/AgentJobExecutionProvider'
import ServiceTransactionProvider from '../../providers/ServiceTransactionProvider'

import type {CenterContext, CenterDestination, CenterItem, CenterTab} from './commandCenter'

export function useCommandCenter() {
  const {hasPermission} = useAuth()
  const route = useRoute()
  const router = useRouter()
  const entities = centerEntities()
  const can = (tab: CenterTab, operation: 'view' | 'create' | 'update' | 'delete') => {
    const permissions = entities.find(entity => entity.key === tab)!.crud.permissions
    return hasPermission(permissions[operation]) || (['services', 'serviceTransactions'].includes(tab) && hasPermission(permissions.manage))
  }
  const visibleEntities = computed(() => entities.filter(entity => can(entity.key, 'view')))
  const activeTab = ref<CenterTab>('tasks')
  const states = reactive(Object.fromEntries(entities.map(entity => [entity.key, {
    search: '', preset: '', context: undefined as CenterContext | undefined, page: 1,
    sortKey: entity.columns[0]!, sortOrder: 'asc' as 'asc' | 'desc',
    items: [] as CenterItem[], total: 0, loading: false, error: false, loaded: false, request: 0,
    memoryType: '', memoryArea: '', memoryTag: '',
  }])) as Record<CenterTab, {
    search: string; preset: string; context?: CenterContext; page: number; sortKey: string; sortOrder: 'asc' | 'desc'
    items: CenterItem[]; total: number; loading: boolean; error: boolean; loaded: boolean; request: number
    memoryType: string; memoryArea: string; memoryTag: string
  }>)
  const activeEntity = computed(() => entities.find(entity => entity.key === activeTab.value)!)
  const state = computed(() => states[activeTab.value])
  const canMetric = (metric: typeof centerMetrics[number]) => can(metric.tab, 'view') && (!metric.permission || hasPermission(metric.permission))
  const metrics = reactive(centerMetrics.map(metric => ({...metric, total: null as number | null, loading: false, error: false})))
  const memory = reactive({item: null as CenterItem | null, loading: false, error: false, index: -1})
  const attention = reactive({item: null as CenterItem | null, reason: '', loading: false, error: false})
  const automation = reactive({item: null as CenterItem | null, tab: 'schedules' as CenterTab, loading: false, error: false})
  const refreshedAt = ref<Date>()
  const refreshing = ref(false)
  let disposed = false
  let searchTimer: ReturnType<typeof setTimeout> | undefined

  function provider(tab: CenterTab) {
    return entities.find(entity => entity.key === tab)!.crud.provider
  }

  async function generatedTasks() {
    const rows = await provider('tasks').groupBy!({fields: ['taskSchedule']})
    return rows.filter((row: Record<string, unknown>) => referenceId(row.taskSchedule)) as {taskSchedule: unknown; count: number}[]
  }

  async function load(tab = activeTab.value) {
    if (!can(tab, 'view')) return
    const current = states[tab]
    const request = ++current.request
    current.loading = true
    current.error = false
    const filters = centerFilters(tab, current.preset, current.context)
    if (tab === 'memories') {
      for (const [field, value] of [['type', current.memoryType], ['lifeArea', current.memoryArea], ['tags', current.memoryTag]]) {
        if (value) filters.push({field: field!, operator: field === 'tags' ? 'in' : 'eq', value})
      }
    }
    try {
      if (tab === 'tasks' && current.preset === 'generated') {
        const rows = await generatedTasks()
        if (!rows.length) {
          if (!disposed && request === current.request) {
            current.items = []; current.total = 0; current.loaded = true
          }
          return
        }
        filters.push({field: 'taskSchedule', operator: 'in', value: rows.map(row => referenceId(row.taskSchedule)!)})
      }
      if (tab === 'serviceTransactions' && ['income_month', 'expense_month'].includes(current.preset)) {
        const summary = await ServiceTransactionProvider.instance.monthly(currentPeriod())
        const type = current.preset === 'income_month' ? 'INCOME' : 'EXPENSE'
        const ids = [...new Set(summary.transactions.filter(item => item.status === 'PAID' && item.service.type === type).map(item => item.service._id))]
        if (!ids.length) {
          if (!disposed && request === current.request) {
            current.items = []; current.total = 0; current.loaded = true
          }
          return
        }
        filters.push({field: 'service', operator: 'in', value: ids})
      }
      const result = await provider(tab).paginate({page: current.page, limit: 10, search: current.search, orderBy: current.sortKey, order: current.sortOrder, filters})
      if (disposed || request !== current.request) return
      if (current.page > 1 && result.total <= (current.page - 1) * 10) {
        current.page = Math.max(1, Math.ceil(result.total / 10))
        return load(tab)
      }
      current.items = result.items
      current.total = result.total
      current.loaded = true
    } catch {
      if (request === current.request) current.error = true
    } finally {
      if (request === current.request) current.loading = false
    }
  }

  async function loadMetrics() {
    let monthly: ReturnType<typeof ServiceTransactionProvider.instance.monthly> | undefined
    await Promise.allSettled(metrics.filter(canMetric).map(async metric => {
      metric.loading = true
      metric.error = false
      try {
        if (metric.tab === 'serviceTransactions' && ['paid_month', 'income_month', 'expense_month'].includes(metric.preset)) {
          monthly ??= ServiceTransactionProvider.instance.monthly(currentPeriod())
          const summary = await monthly
          metric.total = metric.preset === 'paid_month' ? summary.transactions.filter(item => item.status === 'PAID').length
            : metric.preset === 'income_month' ? summary.collectedIncome : summary.paidExpenses
        } else if (metric.preset === 'executed') {
          let total = 0
          // Keep owner-scoped job IDs in every history request and bound URL size.
          for (let page = 1; ; page++) {
            const jobs = await provider('jobs').paginate({page, limit: 50, orderBy: '_id', order: 'asc'})
            if (!jobs.items.length) break
            const result = await AgentJobExecutionProvider.instance.paginate({page: 1, limit: 1, filters: [
              {field: 'jobId', operator: 'in', value: jobs.items.map(job => job._id)},
              {field: 'status', operator: 'in', value: ['success', 'failed', 'timeout']},
            ]})
            total += result.total
            if (page * 50 >= jobs.total) break
          }
          metric.total = total
        } else if (metric.preset === 'generated') {
          const rows = await generatedTasks()
          metric.total = rows.reduce((total, row) => total + Number(row.count), 0)
        } else {
          const result = await provider(metric.tab).paginate({page: 1, limit: 1, filters: centerFilters(metric.tab, metric.preset)})
          metric.total = result.total
        }
      } catch {
        metric.total = null
        metric.error = true
      } finally {
        metric.loading = false
      }
    }))
  }

  async function anotherMemory() {
    if (!can('memories', 'view') || memory.loading) return
    memory.loading = true
    memory.error = false
    try {
      const first = await provider('memories').paginate({page: 1, limit: 1, orderBy: '_id', order: 'asc'})
      if (!first.total) {
        memory.item = null
        memory.index = -1
        return
      }
      let index = Math.floor(Math.random() * first.total)
      if (first.total > 1 && index === memory.index) index = (index + 1 + Math.floor(Math.random() * (first.total - 1))) % first.total
      const result = index === 0 ? first : await provider('memories').paginate({page: index + 1, limit: 1, orderBy: '_id', order: 'asc'})
      memory.item = result.items[0] ?? first.items[0] ?? null
      memory.index = index
    } catch {
      memory.error = true
    } finally {
      memory.loading = false
    }
  }

  async function loadAttention() {
    if (!can('tasks', 'view')) return
    attention.loading = true
    attention.error = false
    try {
      const overdue = await provider('tasks').paginate({page: 1, limit: 1, orderBy: 'dueDate', order: 'asc', filters: centerFilters('tasks', 'overdue')})
      const result = overdue.total ? overdue : await provider('tasks').paginate({page: 1, limit: 1, orderBy: 'createdAt', order: 'asc', filters: centerFilters('tasks', 'urgent')})
      attention.item = result.items[0] ?? null
      attention.reason = overdue.total ? 'overdue' : 'urgent'
    } catch {
      attention.error = true
    } finally {
      attention.loading = false
    }
  }

  async function loadAutomation() {
    automation.loading = true
    automation.error = false
    try {
      const results = await Promise.all(entities.filter(entity => ['schedules', 'jobs'].includes(entity.key) && can(entity.key, 'view')).map(async entity => {
        const result = await provider(entity.key).paginate({page: 1, limit: 1, orderBy: 'runtime.nextRunAt', order: 'asc', filters: [
          ...centerFilters(entity.key, 'active'), {field: 'runtime.nextRunAt', operator: 'gte', value: new Date().toISOString()},
        ]})
        return {tab: entity.key, item: result.items[0] as CenterItem | undefined}
      }))
      const next = results.filter(result => result.item).sort((left, right) => String(valueAt(left.item, 'runtime.nextRunAt')).localeCompare(String(valueAt(right.item, 'runtime.nextRunAt'))))[0]
      automation.item = next?.item ?? null
      automation.tab = next?.tab ?? 'schedules'
    } catch {
      automation.error = true
    } finally {
      automation.loading = false
    }
  }

  async function refresh() {
    if (refreshing.value) return
    refreshing.value = true
    try {
      await Promise.allSettled([state.value.loading ? Promise.resolve() : load(), loadMetrics(), loadAttention(), loadAutomation()])
      refreshedAt.value = new Date()
    } finally {
      refreshing.value = false
    }
  }

  async function changed(tab: CenterTab, item?: CenterItem) {
    states[tab].loaded = false
    if (tab === 'memories' && memory.item?._id === item?._id && item) memory.item = item
    if (tab === activeTab.value) await load(tab)
    await Promise.allSettled([loadMetrics(), loadAttention(), loadAutomation()])
  }

  function navigate(destination: CenterDestination) {
    if (destination.tab === 'schedules' && destination.preset === 'generated') destination = {tab: 'tasks', preset: 'generated'}
    if (!can(destination.tab, 'view')) return
    const current = states[destination.tab]
    current.preset = destination.preset ?? ''
    current.context = destination.context
    current.search = ''
    current.page = 1
    current.loaded = false
    void router.replace({query: {...route.query, tab: destination.tab, preset: current.preset || undefined,
      contextField: current.context?.field, contextId: current.context?.id, contextLabel: current.context?.label}}).then(() => {
      if (!current.loading && !current.loaded) void load(destination.tab)
    })
  }

  function selectTab(tab: CenterTab) {
    const current = states[tab]
    void router.replace({query: {...route.query, tab, preset: current.preset || undefined,
      contextField: current.context?.field, contextId: current.context?.id, contextLabel: current.context?.label}})
  }

  watch(() => route.query, query => {
    const entity = visibleEntities.value.find(entry => entry.key === query.tab) ?? visibleEntities.value[0]
    if (!entity) return
    const current = states[entity.key]
    const preset = typeof query.preset === 'string' ? query.preset : ''
    const allowedFields: Partial<Record<CenterTab, string[]>> = {tasks: ['project', 'goals', 'taskSchedule'], projects: ['businessPartner'], serviceTransactions: ['service']}
    const context = typeof query.contextField === 'string' && allowedFields[entity.key]?.includes(query.contextField) && typeof query.contextId === 'string'
      ? {field: query.contextField, id: query.contextId, label: String(query.contextLabel || query.contextId)} : undefined
    const modified = current.preset !== preset || JSON.stringify(current.context) !== JSON.stringify(context)
    current.preset = preset
    current.context = context
    if (modified) current.page = 1
    activeTab.value = entity.key
    if (!current.loaded || modified) void load(entity.key)
  }, {immediate: true})

  watch(() => [activeTab.value, state.value.search, state.value.memoryType, state.value.memoryArea, state.value.memoryTag], (values, previous) => {
    if (values[0] !== previous[0]) {
      if (searchTimer) {
        clearTimeout(searchTimer)
        states[previous[0] as CenterTab].loaded = false
        searchTimer = undefined
      }
      return
    }
    clearTimeout(searchTimer)
    const tab = activeTab.value
    states[tab].page = 1
    states[tab].request++
    searchTimer = setTimeout(() => {
      searchTimer = undefined
      void load(tab)
    }, 300)
  })

  onBeforeUnmount(() => {
    disposed = true
    clearTimeout(searchTimer)
  })

  return {entities, visibleEntities, activeTab, activeEntity, state, metrics, memory, attention, automation,
    can, canMetric, load, loadMetrics, anotherMemory, loadAttention, loadAutomation, refresh, refreshedAt, refreshing, changed, navigate, selectTab}
}
