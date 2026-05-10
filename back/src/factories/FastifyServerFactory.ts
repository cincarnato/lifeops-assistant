import FastifyServer from "../servers/FastifyServer.js";
import {
    jwtMiddleware,
    rbacMiddleware,
    apiKeyMiddleware,
    UserRoutes,
    RoleRoutes,
    TenantRoutes,
    UserApiKeyRoutes,
    UserSessionRoutes,
    UserLoginFailRoutes
} from "@drax/identity-back"
import {MediaRoutes, FileRoutes} from "@drax/media-back"
import {SettingRoutes} from "@drax/settings-back"
import {DashboardRoutes} from "@drax/dashboard-back";
import {AuditRoutes} from "@drax/audit-back";
import {AIRoutes, AILogRoutes} from "@drax/ai-back";
import {CrudSavedQueryFastifyRoutes} from "@drax/crud-back";
//Local modules routes
import {GoogleFastifyRoutes} from "../modules/google/routes/GoogleRoutes.js"
import {HealthRoutes} from "../modules/base/routes/HealthRoutes.js"
import {NotificationFastifyRoutes} from "../modules/base/routes/NotificationRoutes.js"
import {GoalFastifyRoutes} from "../modules/lifeops/routes/GoalRoutes.js"
import {ProjectFastifyRoutes} from "../modules/lifeops/routes/ProjectRoutes.js"
import {ClientFastifyRoutes} from "../modules/lifeops/routes/ClientRoutes.js"
import {ContactFastifyRoutes} from "../modules/lifeops/routes/ContactRoutes.js"
import {CompanyFastifyRoutes} from "../modules/lifeops/routes/CompanyRoutes.js"
import {TaskTypeFastifyRoutes} from "../modules/lifeops/routes/TaskTypeRoutes.js"
import {TaskStatusFastifyRoutes} from "../modules/lifeops/routes/TaskStatusRoutes.js"
import {TaskSourceFastifyRoutes} from "../modules/lifeops/routes/TaskSourceRoutes.js"
import {TaskFastifyRoutes} from "../modules/lifeops/routes/TaskRoutes.js"
import {PriorityFastifyRoutes} from "../modules/lifeops/routes/PriorityRoutes.js"
import {ChatbotTaskFastifyRoutes} from "../modules/lifeops/routes/ChatbotTaskRoutes.js"
import {ContactTypeFastifyRoutes} from "../modules/lifeops/routes/ContactTypeRoutes.js"
import {CompanyTypeFastifyRoutes} from "../modules/lifeops/routes/CompanyTypeRoutes.js"
import {ClientTypeFastifyRoutes} from "../modules/lifeops/routes/ClientTypeRoutes.js"

function FastifyServerFactory(rootDir:string) {
    const server = new FastifyServer(rootDir);
    server.fastifyDecorateRequest('authUser',null)

    //MIDDLEWARES
    server.fastifyHook('onRequest',jwtMiddleware)
    server.fastifyHook('onRequest',apiKeyMiddleware)
    server.fastifyHook('onRequest',rbacMiddleware)

    //IDENTITY ROUTES
    server.fastifyRegister(UserRoutes)
    server.fastifyRegister(RoleRoutes)
    server.fastifyRegister(TenantRoutes)
    server.fastifyRegister(UserApiKeyRoutes)
    server.fastifyRegister(UserSessionRoutes)
    server.fastifyRegister(UserLoginFailRoutes)

    //DRAX MODULES ROUTES
    server.fastifyRegister(AuditRoutes)
    server.fastifyRegister(MediaRoutes)
    server.fastifyRegister(FileRoutes)
    server.fastifyRegister(SettingRoutes)
    server.fastifyRegister(DashboardRoutes)
    server.fastifyRegister(AIRoutes)
    server.fastifyRegister(AILogRoutes)
    server.fastifyRegister(CrudSavedQueryFastifyRoutes)

    //LOCAL MODULES ROUTES
    server.fastifyRegister(GoogleFastifyRoutes)
    server.fastifyRegister(HealthRoutes)
    server.fastifyRegister(NotificationFastifyRoutes)
    server.fastifyRegister(GoalFastifyRoutes)
    server.fastifyRegister(ProjectFastifyRoutes)
    server.fastifyRegister(ClientFastifyRoutes)
    server.fastifyRegister(ContactFastifyRoutes)
    server.fastifyRegister(CompanyFastifyRoutes)
    server.fastifyRegister(TaskTypeFastifyRoutes)
    server.fastifyRegister(TaskStatusFastifyRoutes)
    server.fastifyRegister(TaskSourceFastifyRoutes)
    server.fastifyRegister(TaskFastifyRoutes)
    server.fastifyRegister(PriorityFastifyRoutes)
    server.fastifyRegister(ContactTypeFastifyRoutes)
    server.fastifyRegister(CompanyTypeFastifyRoutes)
    server.fastifyRegister(ClientTypeFastifyRoutes)
    server.fastifyRegister(ChatbotTaskFastifyRoutes)




    return server
}

export default FastifyServerFactory
