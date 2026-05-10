
import ProjectCrudPage from "../pages/crud/ProjectCrudPage.vue";


const ProjectCrudRoute = [
  {
    name: 'ProjectCrudPage',
    path: '/crud/project',
    component: ProjectCrudPage,
    meta: {
      auth: true,
      permission: 'project:manage',
    }
  },
]

export default ProjectCrudRoute
export { ProjectCrudRoute }
