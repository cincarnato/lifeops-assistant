import baseRoutes from '../modules/base/routes/index.js'
import googleRoutes from '../modules/google/routes/index.js'
import lifeopsRoutes from '../modules/lifeops/routes/index.js'
import pushRoutes from '../modules/push/routes/index.js'
import metaRoutes from '../modules/meta/routes/index.js'

const modulesRoutes = [
  ...baseRoutes,
  ...googleRoutes,
  ...lifeopsRoutes,
  ...pushRoutes,
  ...metaRoutes

]

export default modulesRoutes
export {modulesRoutes}
