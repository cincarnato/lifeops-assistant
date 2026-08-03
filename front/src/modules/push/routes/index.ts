
import PushDeviceCrudRoute from "./PushDeviceCrudRoute"
import PushMessageCrudRoute from "./PushMessageCrudRoute"
import WebPushNotificationRoute from "./WebPushNotificationRoute"

export const routes = [
    ...PushDeviceCrudRoute,
...PushMessageCrudRoute,
...WebPushNotificationRoute
]

export default routes
