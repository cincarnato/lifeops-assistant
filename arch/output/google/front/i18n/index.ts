
import merge from "deepmerge";
import GoogleConnectionMessages from "./GoogleConnection-i18n"

const messages = merge.all([
    GoogleConnectionMessages
])

export default messages
