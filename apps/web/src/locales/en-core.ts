import { auth } from './auth'
import { landingEn } from './landing-en'
import { common } from './common'
import { settings } from './settings'
import { account } from './account'
import { legal, privacy, terms } from './legal'

export default {
  auth: auth.en,
  landing: landingEn,
  common: common.en,
  settings: settings.en,
  account: account.en,
  legal: legal.en,
  privacy: privacy.en,
  terms: terms.en,
} as const
