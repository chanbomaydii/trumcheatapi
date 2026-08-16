import landing from './landing'
import common from './common'
import dashboard from './dashboard'
import channelMonitorV2 from './channelMonitorV2'
import batchImage from './batchImage'
import misc from './misc'

// NOTE: Vietnamese locale intentionally covers only the customer-facing
// namespaces (landing, common, dashboard, channelMonitorV2, batchImage, misc).
// The admin namespace is operator-only (English/Chinese speaking staff) and is
// deliberately NOT translated here. Untranslated keys fall back to English via
// i18n's fallbackLocale, never render as raw dotted key paths.
export default {
  ...landing,
  ...common,
  ...dashboard,
  ...channelMonitorV2,
  ...batchImage,
  ...misc,
}
