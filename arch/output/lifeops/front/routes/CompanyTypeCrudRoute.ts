
import CompanyTypeCrudPage from "../pages/crud/CompanyTypeCrudPage.vue";


const CompanyTypeCrudRoute = [
  {
    name: 'CompanyTypeCrudPage',
    path: '/crud/companytype',
    component: CompanyTypeCrudPage,
    meta: {
      auth: true,
      permission: 'companytype:manage',
    }
  },
]

export default CompanyTypeCrudRoute
export { CompanyTypeCrudRoute }
