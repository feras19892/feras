import { auth } from './auth'
import { landingEs } from './landing-es'
import { common } from './common'
import { settings } from './settings'
import { account } from './account'
import { legal, privacy, terms } from './legal'

import { subscriptions } from './subscriptions'
import { hardcoded } from './hardcoded'

export default {
  auth: auth.es,
  landing: landingEs,
  common: common.es,
  settings: settings.es,
  account: account.es,
  legal: legal.es,
  privacy: privacy.es,
  terms: terms.es,
  subscriptions: subscriptions.es,
  hardcoded: hardcoded.es,
} as const
