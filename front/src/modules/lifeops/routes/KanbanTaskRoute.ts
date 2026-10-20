import KanbanTaskPage from "../pages/KanbanTaskPage.vue";

const KanbanTaskRoute = [
  {
    name: 'KanbanTaskPage',
    path: '/tasks/kanban',
    component: KanbanTaskPage,
    meta: {
      auth: true,
      permission: 'task:view',
      layout: 'bottom',
    }
  },
]

export default KanbanTaskRoute
export { KanbanTaskRoute }
