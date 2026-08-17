import { auth } from './auth'
import { landingAr } from './landing-ar'
import { common } from './common'
import { settings } from './settings'
import { account } from './account'
import { legal, privacy, terms } from './legal'

export default {
  auth: auth.ar,
  landing: landingAr,
  common: common.ar,
  settings: settings.ar,
  account: account.ar,
  legal: legal.ar,
  privacy: privacy.ar,
  terms: terms.ar,
} as const
