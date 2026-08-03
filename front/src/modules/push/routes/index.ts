
import PushDeviceCrudRoute from "./PushDeviceCrudRoute"
import PushMessageCrudRoute from "./PushMessageCrudRoute"
import WebPushNotificationRoute from "./WebPushNotificationRoute"
import PushMessageReceptionRoute from "./PushMessageReceptionRoute"

export const routes = [
    ...PushDeviceCrudRoute,
...PushMessageCrudRoute,
...WebPushNotificationRoute,
...PushMessageReceptionRoute
]

export default routes
