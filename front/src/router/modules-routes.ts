import baseRoutes from '../modules/base/routes/index.js'
import googleRoutes from '../modules/google/routes/index.js'
import lifeopsRoutes from '../modules/lifeops/routes/index.js'

const modulesRoutes = [
  ...baseRoutes,
  ...googleRoutes,
  ...lifeopsRoutes

]

export default modulesRoutes
export {modulesRoutes}
