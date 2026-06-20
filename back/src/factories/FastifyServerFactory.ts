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
import {AIRoutes, AILogRoutes, AgentSessionRoutes, DraxAgentRoutes, TTSRoutes, TTSVoiceRoutes} from "@drax/ai-back";
import {CrudSavedQueryFastifyRoutes} from "@drax/crud-back";
//Local modules routes
import {GoogleFastifyRoutes} from "../modules/google/routes/GoogleRoutes.js"
import {GoogleConnectionFastifyRoutes} from "../modules/google/routes/GoogleConnectionRoutes.js"
import {GoogleGmailFastifyRoutes} from "../modules/google/routes/GoogleGmailRoutes.js"
import {GoogleCalendarFastifyRoutes} from "../modules/google/routes/GoogleCalendarRoutes.js"
import {GoogleContactsFastifyRoutes} from "../modules/google/routes/GoogleContactsRoutes.js"
import {HealthRoutes} from "../modules/base/routes/HealthRoutes.js"
import {AccountRoutes} from "../modules/base/routes/AccountRoutes.js"
import {NotificationFastifyRoutes} from "../modules/base/routes/NotificationRoutes.js"
import {GoalFastifyRoutes} from "../modules/lifeops/routes/GoalRoutes.js"
import {ProjectFastifyRoutes} from "../modules/lifeops/routes/ProjectRoutes.js"
import {ClientFastifyRoutes} from "../modules/lifeops/routes/ClientRoutes.js"
import {ContactFastifyRoutes} from "../modules/lifeops/routes/ContactRoutes.js"
import {CompanyFastifyRoutes} from "../modules/lifeops/routes/CompanyRoutes.js"
import {TaskTypeFastifyRoutes} from "../modules/lifeops/routes/TaskTypeRoutes.js"
import {TaskStatusFastifyRoutes} from "../modules/lifeops/routes/TaskStatusRoutes.js"
import {SourceFastifyRoutes} from "../modules/lifeops/routes/SourceRoutes.js"
import {TaskFastifyRoutes} from "../modules/lifeops/routes/TaskRoutes.js"
import {PriorityFastifyRoutes} from "../modules/lifeops/routes/PriorityRoutes.js"
import {ContactTypeFastifyRoutes} from "../modules/lifeops/routes/ContactTypeRoutes.js"
import {CompanyTypeFastifyRoutes} from "../modules/lifeops/routes/CompanyTypeRoutes.js"
import {ClientTypeFastifyRoutes} from "../modules/lifeops/routes/ClientTypeRoutes.js"
import {AgentJobFastifyRoutes} from "../modules/lifeops/routes/AgentJobRoutes.js"
import {AgentJobExecutionFastifyRoutes} from "../modules/lifeops/routes/AgentJobExecutionRoutes.js"
import {MemoryFastifyRoutes} from "../modules/lifeops/routes/MemoryRoutes.js"
import {MemoryTypeFastifyRoutes} from "../modules/lifeops/routes/MemoryTypeRoutes.js"
import {PurposeFastifyRoutes} from "../modules/lifeops/routes/PurposeRoutes.js"
import {LifeAreaFastifyRoutes} from "../modules/lifeops/routes/LifeAreaRoutes.js"
import {HabitFastifyRoutes} from "../modules/lifeops/routes/HabitRoutes.js"
import {HabitLogFastifyRoutes} from "../modules/lifeops/routes/HabitLogRoutes.js"
import {PushDeviceFastifyRoutes} from "../modules/push/routes/PushDeviceRoutes.js"
import {PushMessageFastifyRoutes} from "../modules/push/routes/PushMessageRoutes.js"

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
    server.fastifyRegister(TTSRoutes)
    server.fastifyRegister(TTSVoiceRoutes)
    server.fastifyRegister(AILogRoutes)
    server.fastifyRegister(AgentSessionRoutes)
    server.fastifyRegister(DraxAgentRoutes)

    server.fastifyRegister(CrudSavedQueryFastifyRoutes)

    //LOCAL MODULES ROUTES
    server.fastifyRegister(GoogleFastifyRoutes)
    server.fastifyRegister(GoogleConnectionFastifyRoutes)
    server.fastifyRegister(GoogleGmailFastifyRoutes)
    server.fastifyRegister(GoogleCalendarFastifyRoutes)
    server.fastifyRegister(GoogleContactsFastifyRoutes)
    server.fastifyRegister(HealthRoutes)
    server.fastifyRegister(AccountRoutes)
    server.fastifyRegister(NotificationFastifyRoutes)
    server.fastifyRegister(GoalFastifyRoutes)
    server.fastifyRegister(ProjectFastifyRoutes)
    server.fastifyRegister(ClientFastifyRoutes)
    server.fastifyRegister(ContactFastifyRoutes)
    server.fastifyRegister(CompanyFastifyRoutes)
    server.fastifyRegister(TaskTypeFastifyRoutes)
    server.fastifyRegister(TaskStatusFastifyRoutes)
    server.fastifyRegister(SourceFastifyRoutes)
    server.fastifyRegister(TaskFastifyRoutes)
    server.fastifyRegister(PriorityFastifyRoutes)
    server.fastifyRegister(ContactTypeFastifyRoutes)
    server.fastifyRegister(CompanyTypeFastifyRoutes)
    server.fastifyRegister(ClientTypeFastifyRoutes)
    server.fastifyRegister(AgentJobFastifyRoutes)
    server.fastifyRegister(AgentJobExecutionFastifyRoutes)
    server.fastifyRegister(MemoryFastifyRoutes)
    server.fastifyRegister(MemoryTypeFastifyRoutes)
    server.fastifyRegister(PurposeFastifyRoutes)
    server.fastifyRegister(LifeAreaFastifyRoutes)
    server.fastifyRegister(HabitFastifyRoutes)
    server.fastifyRegister(HabitLogFastifyRoutes)
    server.fastifyRegister(PushDeviceFastifyRoutes)
    server.fastifyRegister(PushMessageFastifyRoutes)



    return server
}

export default FastifyServerFactory
