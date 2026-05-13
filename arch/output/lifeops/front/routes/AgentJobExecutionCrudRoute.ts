
import AgentJobExecutionCrudPage from "../pages/crud/AgentJobExecutionCrudPage.vue";


const AgentJobExecutionCrudRoute = [
  {
    name: 'AgentJobExecutionCrudPage',
    path: '/crud/agentjobexecution',
    component: AgentJobExecutionCrudPage,
    meta: {
      auth: true,
      permission: 'agentjobexecution:manage',
    }
  },
]

export default AgentJobExecutionCrudRoute
export { AgentJobExecutionCrudRoute }
