
import BusinessPartnerCrudPage from "../pages/crud/BusinessPartnerCrudPage.vue";


const BusinessPartnerCrudRoute = [
  {
    name: 'BusinessPartnerCrudPage',
    path: '/crud/business-partner',
    component: BusinessPartnerCrudPage,
    meta: {
      auth: true,
      permission: 'businesspartner:manage',
    }
  },
]

export default BusinessPartnerCrudRoute
export { BusinessPartnerCrudRoute }
