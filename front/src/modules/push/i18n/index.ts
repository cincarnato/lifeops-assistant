
import merge from "deepmerge";
import PushDeviceMessages from "./PushDevice-i18n"
import PushMessageMessages from "./PushMessage-i18n"
import PushWebNotificationMessages from "./PushWebNotification-i18n"

const messages = merge.all([
    PushDeviceMessages,
    PushMessageMessages,
    PushWebNotificationMessages
])

export default messages
