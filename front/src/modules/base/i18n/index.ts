
import merge from "deepmerge";
import NotificationMessages from "./Notification-i18n"
import LandingMessages from "./Landing-i18n"

const baseI18n = merge.all([
    NotificationMessages,
    LandingMessages,
])

export default baseI18n
export {
  baseI18n
}
