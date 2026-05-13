import KanbanTaskPage from "../pages/KanbanTaskPage.vue";

const KanbanTaskRoute = [
  {
    name: 'KanbanTaskPage',
    path: '/tasks/kanban',
    component: KanbanTaskPage,
    meta: {
      auth: true,
      permission: 'task:view',
    }
  },
]

export default KanbanTaskRoute
export { KanbanTaskRoute }
