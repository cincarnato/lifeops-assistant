
import AgentJobCrudPage from "../pages/crud/AgentJobCrudPage.vue";


const AgentJobCrudRoute = [
  {
    name: 'AgentJobCrudPage',
    path: '/crud/agentjob',
    component: AgentJobCrudPage,
    meta: {
      auth: true,
      permission: 'agentjob:manage',
    }
  },
]

export default AgentJobCrudRoute
export { AgentJobCrudRoute }
