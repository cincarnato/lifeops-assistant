
import merge from "deepmerge";
import PushDeviceMessages from "./PushDevice-i18n"
import PushMessageMessages from "./PushMessage-i18n"

const messages = merge.all([
    PushDeviceMessages,
    PushMessageMessages
])

export default messages
