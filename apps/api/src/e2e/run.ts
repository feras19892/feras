import { randomBytes } from 'node:crypto'

process.env.NODE_ENV = 'test'
process.env.DB_PATH = ':memory:'
process.env.SKIP_SERVE = '1'
process.env.JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex')
process.env.SENTRY_DSN = ''
process.env.ADMIN_NAME = ''
process.env.ADMIN_PASSWORD = ''

await import('./reports-isolation.test.js')
