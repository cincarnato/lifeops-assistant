import merge from 'deepmerge'
import {LocaleMessages} from "vue-i18n";
import baseI18n from '../modules/base/i18n/index'
import googleI18n from '../modules/google/i18n/index'
import lifeopsI18n from '../modules/lifeops/i18n/index'
import pushI18n from '../modules/push/i18n/index'

const modulesI18n = merge.all([
  baseI18n,
  googleI18n,
  lifeopsI18n,
  pushI18n,
]) as LocaleMessages<never>

export default modulesI18n

export {
  modulesI18n
}
