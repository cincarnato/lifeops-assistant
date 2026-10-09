import type {IDraxFieldFilter, IEntityCrud} from '@drax/crud-share'
import TaskCrud from '../../cruds/TaskCrud'
import TaskScheduleCrud from '../../cruds/TaskScheduleCrud'
import AgentJobCrud from '../../cruds/AgentJobCrud'
import ProjectCrud from '../../cruds/ProjectCrud'
import GoalCrud from '../../cruds/GoalCrud'
import ContactCrud from '../../cruds/ContactCrud'
import BusinessPartnerCrud from '../../cruds/BusinessPartnerCrud'
import MemoryCrud from '../../cruds/MemoryCrud'
import ServiceCrud from '../../cruds/ServiceCrud'
import ServiceTransactionCrud from '../../cruds/ServiceTransactionCrud'

export type CenterTab = 'tasks' | 'schedules' | 'jobs' | 'projects' | 'goals' | 'contacts' | 'businessPartners' | 'memories' | 'services' | 'serviceTransactions'
export type CenterItem = Record<string, unknown> & {_id: string}
export interface CenterEntity {
  key: CenterTab
  icon: string
  crud: IEntityCrud
  columns: string[]
}
export interface CenterContext {
  field: string
  id: string
  label: string
}
export interface CenterDestination {
  tab: CenterTab
  preset?: string
  context?: CenterContext
}

export function centerEntities(): CenterEntity[] {
  return [
    {key: 'tasks', icon: 'mdi-format-list-checks', crud: TaskCrud.instance, columns: ['title', 'status', 'priority', 'project', 'dueDate', 'scheduledDate']},
    {key: 'schedules', icon: 'mdi-calendar-sync-outline', crud: TaskScheduleCrud.instance, columns: ['name', 'task.title', 'schedule', 'active', 'runtime.nextRunAt', 'runtime.lastStatus']},
    {key: 'jobs', icon: 'mdi-robot-outline', crud: AgentJobCrud.instance, columns: ['name', 'schedule', 'active', 'runtime.nextRunAt', 'runtime.lastStatus']},
    {key: 'projects', icon: 'mdi-briefcase-outline', crud: ProjectCrud.instance, columns: ['name', 'priority', 'businessPartner', 'tags']},
    {key: 'goals', icon: 'mdi-bullseye-arrow', crud: GoalCrud.instance, columns: ['name', 'lifeArea', 'timeHorizon', 'targetDate', 'progressPercent']},
    {key: 'contacts', icon: 'mdi-account-box-outline', crud: ContactCrud.instance, columns: ['displayName', 'emails', 'phones', 'organization', 'status']},
    {key: 'businessPartners', icon: 'mdi-domain', crud: BusinessPartnerCrud.instance, columns: ['name', 'roles', 'mainContact', 'priority']},
    {key: 'memories', icon: 'mdi-brain', crud: MemoryCrud.instance, columns: ['title', 'content', 'type', 'lifeArea', 'tags']},
    {key: 'services', icon: 'mdi-handshake-outline', crud: ServiceCrud.instance, columns: ['name', 'businessPartner', 'type', 'amount', 'frequency', 'active']},
    {key: 'serviceTransactions', icon: 'mdi-cash-clock', crud: ServiceTransactionCrud.instance, columns: ['service', 'period', 'amount', 'status', 'paidAt']},
  ]
}

export function valueAt(item: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, item)
}

export function referenceId(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  const identifier = valueAt(value, '_id')
  return typeof identifier === 'string' ? identifier : undefined
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (Array.isArray(value)) return value.map(displayValue).join(', ')
  if (typeof value === 'object') {
    return String(valueAt(value, 'name') || valueAt(value, 'displayName') || valueAt(value, 'value') || valueAt(value, '_id') || '—')
  }
  return String(value)
}

export function dayBounds(now = new Date()) {
  const date = new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit'}).format(now)
  const start = new Date(`${date}T00:00:00-03:00`)
  return {start: start.toISOString(), end: new Date(start.getTime() + 86400000).toISOString()}
}

export function currentPeriod(now = new Date()) {
  return dayBounds(now).start.slice(0, 7)
}

export function monthBounds(now = new Date()) {
  const [year, month] = currentPeriod(now).split('-').map(Number)
  const start = new Date(`${currentPeriod(now)}-01T00:00:00-03:00`)
  const end = new Date(Date.UTC(year!, month!, 1, 3))
  return {start: start.toISOString(), end: end.toISOString()}
}

export function centerFilters(tab: CenterTab, preset = '', context?: CenterContext): IDraxFieldFilter[] {
  const filters: IDraxFieldFilter[] = []
  if (context) filters.push({field: context.field, operator: 'eq', value: context.id})
  if (tab === 'tasks' && preset) {
    const completed = ['completed_today', 'completed_month'].includes(preset)
    if (!completed && preset !== 'generated') filters.push({field: 'completedAt', operator: 'empty', value: ''}, {field: 'archivedAt', operator: 'empty', value: ''})
    const {start, end} = dayBounds()
    if (completed) {
      const bounds = preset === 'completed_today' ? {start, end} : monthBounds()
      filters.push({field: 'completedAt', operator: 'gte', value: bounds.start}, {field: 'completedAt', operator: 'lt', value: bounds.end})
    }
    if (preset === 'pending') filters.push({field: 'status', operator: 'eq', value: 'Pendiente'})
    if (preset === 'in_progress') filters.push({field: 'status', operator: 'eq', value: 'En progreso'})
    if (preset === 'due_soon') filters.push({field: 'dueDate', operator: 'gte', value: start}, {field: 'dueDate', operator: 'lt', value: new Date(new Date(start).getTime() + 7 * 86400000).toISOString()})
    if (preset === 'overdue') filters.push({field: 'dueDate', operator: 'lt', value: start})
    if (preset === 'urgent') filters.push({field: 'urgent', operator: 'eq', value: true})
    if (preset === 'unassigned') filters.push({field: 'project', operator: 'empty', value: ''})
    if (preset === 'today') {
      const bounds = [{operator: 'gte', value: start}, {operator: 'lt', value: end}]
      for (const [dueIndex, dueBound] of bounds.entries()) {
        for (const [scheduledIndex, scheduledBound] of bounds.entries()) {
          const orGroup = `today${dueIndex}${scheduledIndex}`
          filters.push({field: 'dueDate', ...dueBound, orGroup}, {field: 'scheduledDate', ...scheduledBound, orGroup})
        }
      }
    }
  }
  if (tab === 'serviceTransactions' && ['pending', 'paid'].includes(preset)) filters.push({field: 'status', operator: 'eq', value: preset.toUpperCase()})
  if (tab === 'serviceTransactions' && ['paid_month', 'income_month', 'expense_month'].includes(preset)) filters.push({field: 'status', operator: 'eq', value: 'PAID'}, {field: 'period', operator: 'eq', value: currentPeriod()})
    if (tab === 'jobs' && preset === 'executed') filters.push({field: 'runtime.lastStatus', operator: 'in', value: ['success', 'failed', 'timeout']}, {field: 'runtime.lastRunAt', operator: 'gte', value: '1970-01-01T00:00:00.001Z'})
    if (tab === 'services' && preset === 'inactive') filters.push({field: 'active', operator: 'eq', value: false})
  if (preset === 'active') filters.push({field: 'active', operator: 'eq', value: true})
  if (preset === 'failed') filters.push({field: 'runtime.lastStatus', operator: 'in', value: ['failed', 'timeout']})
  return filters
}

export function centerWorkspaceTabs(entities: CenterEntity[]) {
  const services = entities.filter(entity => ['services', 'serviceTransactions'].includes(entity.key))
  return [
    ...entities.filter(entity => !services.includes(entity)).map(entity => ({key: entity.key, tab: entity.key, icon: entity.icon})),
    ...(services.length ? [{key: 'services' as const, tab: services[0]!.key, icon: 'mdi-handshake-outline'}] : []),
  ]
}

export const centerMetrics: {tab: CenterTab; preset: string; icon: string; color: string; aggregate?: 'amount' | 'runs'; permission?: string}[] = [
  {tab: 'tasks', preset: 'pending', icon: 'mdi-format-list-checks', color: 'primary'},
  {tab: 'tasks', preset: 'in_progress', icon: 'mdi-progress-clock', color: 'info'},
  {tab: 'tasks', preset: 'completed_today', icon: 'mdi-check-circle-outline', color: 'success'},
  {tab: 'tasks', preset: 'due_soon', icon: 'mdi-calendar-clock', color: 'warning'},
  {tab: 'tasks', preset: 'overdue', icon: 'mdi-calendar-alert', color: 'error'},
  {tab: 'tasks', preset: 'completed_month', icon: 'mdi-calendar-check', color: 'success'},
  {tab: 'serviceTransactions', preset: 'pending', icon: 'mdi-cash-clock', color: 'warning'},
  {tab: 'serviceTransactions', preset: 'paid_month', icon: 'mdi-cash-check', color: 'success'},
  {tab: 'serviceTransactions', preset: 'income_month', icon: 'mdi-cash-plus', color: 'success', aggregate: 'amount'},
  {tab: 'serviceTransactions', preset: 'expense_month', icon: 'mdi-cash-minus', color: 'error', aggregate: 'amount'},
  {tab: 'jobs', preset: 'active', icon: 'mdi-robot-outline', color: 'primary'},
  {tab: 'jobs', preset: 'failed', icon: 'mdi-alert-circle-outline', color: 'error'},
  {tab: 'jobs', preset: 'executed', icon: 'mdi-robot-happy-outline', color: 'success', aggregate: 'runs', permission: 'agentjobexecution:view'},
  {tab: 'schedules', preset: 'active', icon: 'mdi-calendar-sync-outline', color: 'info'},
  {tab: 'schedules', preset: 'generated', icon: 'mdi-calendar-multiple-check', color: 'success', permission: 'task:view'},
  {tab: 'goals', preset: 'total', icon: 'mdi-bullseye-arrow', color: 'primary'},
  {tab: 'businessPartners', preset: 'total', icon: 'mdi-domain', color: 'info'},
  {tab: 'services', preset: 'total', icon: 'mdi-handshake-outline', color: 'success'},
  {tab: 'projects', preset: 'total', icon: 'mdi-briefcase-outline', color: 'primary'},
  {tab: 'memories', preset: 'total', icon: 'mdi-brain', color: 'info'},
]
