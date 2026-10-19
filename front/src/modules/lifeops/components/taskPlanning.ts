import type {IDayPlanBase} from '../interfaces/IDayPlan'
export const prioritySlots = ['A1', 'A2', 'A3'] as const
type Entry = NonNullable<IDayPlanBase['tasks']>[number]
export function assignTask(tasks: Entry[], entry: Entry, target: typeof prioritySlots[number] | 'DESEABLE' | null) {
  const priority = target === 'DESEABLE' ? null : target
  for (const previous of tasks) {
    if (priority && previous !== entry && previous.priority === priority) {
      previous.priority = null
      previous.decision = 'PENDIENTE'
    }
  }
  entry.priority = priority
  entry.decision = priority ? 'COMPROMETIDO' : target === 'DESEABLE' ? 'DESEABLE' : 'PENDIENTE'
}
