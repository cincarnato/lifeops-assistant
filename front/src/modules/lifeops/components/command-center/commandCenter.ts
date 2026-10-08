import type {IDraxFieldFilter, IEntityCrud} from '@drax/crud-share'
import TaskCrud from '../../cruds/TaskCrud'
import TaskScheduleCrud from '../../cruds/TaskScheduleCrud'
import AgentJobCrud from '../../cruds/AgentJobCrud'
import ProjectCrud from '../../cruds/ProjectCrud'
import GoalCrud from '../../cruds/GoalCrud'
import ContactCrud from '../../cruds/ContactCrud'
import ClientCrud from '../../cruds/ClientCrud'
import MemoryCrud from '../../cruds/MemoryCrud'

export type CenterTab = 'tasks' | 'schedules' | 'jobs' | 'projects' | 'goals' | 'contacts' | 'clients' | 'memories'
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
    {key: 'projects', icon: 'mdi-briefcase-outline', crud: ProjectCrud.instance, columns: ['name', 'priority', 'client', 'targetDate', 'progressPercent']},
    {key: 'goals', icon: 'mdi-bullseye-arrow', crud: GoalCrud.instance, columns: ['name', 'lifeArea', 'timeHorizon', 'targetDate', 'progressPercent']},
    {key: 'contacts', icon: 'mdi-account-box-outline', crud: ContactCrud.instance, columns: ['displayName', 'emails', 'phones', 'organization', 'status']},
    {key: 'clients', icon: 'mdi-domain', crud: ClientCrud.instance, columns: ['name', 'roles', 'mainContact', 'priority']},
    {key: 'memories', icon: 'mdi-brain', crud: MemoryCrud.instance, columns: ['title', 'content', 'type', 'lifeArea', 'tags']},
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

export function centerFilters(tab: CenterTab, preset = '', context?: CenterContext): IDraxFieldFilter[] {
  const filters: IDraxFieldFilter[] = []
  if (context) filters.push({field: context.field, operator: 'eq', value: context.id})
  if (tab === 'tasks' && preset) {
    filters.push({field: 'completedAt', operator: 'empty', value: ''}, {field: 'archivedAt', operator: 'empty', value: ''})
    const {start, end} = dayBounds()
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
  if (preset === 'active') filters.push({field: 'active', operator: 'eq', value: true})
  if (preset === 'failed') filters.push({field: 'runtime.lastStatus', operator: 'in', value: ['failed', 'timeout']})
  return filters
}

export const centerMetrics: {tab: CenterTab; preset: string; icon: string; color: string}[] = [
  {tab: 'tasks', preset: 'overdue', icon: 'mdi-calendar-alert', color: 'error'},
  {tab: 'tasks', preset: 'today', icon: 'mdi-calendar-today', color: 'primary'},
  {tab: 'tasks', preset: 'urgent', icon: 'mdi-lightning-bolt-outline', color: 'warning'},
  {tab: 'schedules', preset: 'active', icon: 'mdi-calendar-sync-outline', color: 'info'},
  {tab: 'jobs', preset: 'active', icon: 'mdi-robot-outline', color: 'primary'},
  {tab: 'jobs', preset: 'failed', icon: 'mdi-alert-circle-outline', color: 'error'},
]
