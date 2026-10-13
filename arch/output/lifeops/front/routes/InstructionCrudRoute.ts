
import InstructionCrudPage from "../pages/crud/InstructionCrudPage.vue";


const InstructionCrudRoute = [
  {
    name: 'InstructionCrudPage',
    path: '/crud/instruction',
    component: InstructionCrudPage,
    meta: {
      auth: true,
      permission: 'instruction:manage',
    }
  },
]

export default InstructionCrudRoute
export { InstructionCrudRoute }
