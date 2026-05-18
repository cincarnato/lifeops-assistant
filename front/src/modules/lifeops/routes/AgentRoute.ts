
import Agent from "../pages/Agent.vue";


const AgentRoute = [
  {
    name: 'Agent',
    path: '/agent',
    component: Agent,
    meta: {
      auth: true,
      permission: 'agent:session',
      layout: 'base'
    }
  },
]

export default AgentRoute
export { AgentRoute }
