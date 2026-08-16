import '@hono/react-renderer'
import type { Auth } from './lib/auth'
import type { Db } from './lib/db'

type AuthSession = Awaited<ReturnType<Auth['api']['getSession']>>

declare global {
  interface CloudflareBindings {
    DATABASE_URL?: string
    BETTER_AUTH_SECRET?: string
    BETTER_AUTH_URL?: string
    BETTER_AUTH_ALLOWED_HOSTS?: string
  }
}

declare module 'hono' {
  interface Env {
    Bindings: CloudflareBindings
    Variables: {
      db: Db
      auth: Auth
      session: AuthSession
    }
  }
}

declare module '@hono/react-renderer' {
  interface Props {
    title?: string
  }
}

export {}
