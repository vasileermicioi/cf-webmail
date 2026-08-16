import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export function createDb(env: { DATABASE_URL?: string }) {
  if (!env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set on this Worker. Deploy with `npm run deploy` so secrets are uploaded from .dev.vars.',
    )
  }

  return drizzle(neon(env.DATABASE_URL), { schema })
}

export type Db = ReturnType<typeof createDb>
