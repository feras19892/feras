import { auth } from './auth'
import { landingEn } from './landing-en'
import { common } from './common'
import { settings } from './settings'
import { account } from './account'
import { legal, privacy, terms } from './legal'

import { subscriptions } from './subscriptions'
import { hardcoded } from './hardcoded'

export default {
  auth: auth.en,
  landing: landingEn,
  common: common.en,
  settings: settings.en,
  account: account.en,
  legal: legal.en,
  privacy: privacy.en,
  terms: terms.en,
  subscriptions: subscriptions.en,
  hardcoded: hardcoded.en,
} as const
