import { auth } from './auth'
import { landingAr } from './landing-ar'
import { common } from './common'
import { settings } from './settings'
import { account } from './account'
import { legal, privacy, terms } from './legal'

import { subscriptions } from './subscriptions'
import { hardcoded } from './hardcoded'

export default {
  auth: auth.ar,
  landing: landingAr,
  common: common.ar,
  settings: settings.ar,
  account: account.ar,
  legal: legal.ar,
  privacy: privacy.ar,
  terms: terms.ar,
  subscriptions: subscriptions.ar,
  hardcoded: hardcoded.ar,
} as const
