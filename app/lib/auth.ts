import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import type { Db } from './db'
import { createDb } from './db'
import * as schema from './db/schema'

function requestOrigins(env: CloudflareBindings, request?: Request) {
  const origins = new Set<string>([env.BETTER_AUTH_URL])
  if (!request) return [...origins]

  try {
    origins.add(new URL(request.url).origin)
  } catch {
    // ignore invalid request URLs
  }

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (host) {
    const proto =
      request.headers.get('x-forwarded-proto') ??
      (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')
    origins.add(`${proto}://${host}`)
  }

  const originHeader = request.headers.get('origin')
  if (originHeader) {
    try {
      const originUrl = new URL(originHeader)
      if (
        originUrl.hostname === 'localhost' ||
        originUrl.hostname === '127.0.0.1' ||
        originUrl.hostname === '::1'
      ) {
        origins.add(originUrl.origin)
      }
    } catch {
      // ignore invalid origin headers
    }
  }

  return [...origins]
}

export function createAuth(env: CloudflareBindings, db?: Db) {
  const database = db ?? createDb(env)

  return betterAuth({
    appName: 'CF Webmail',
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(database, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 8,
    },
    plugins: [
      admin({
        defaultRole: 'user',
        adminRoles: ['admin'],
      }),
    ],
    trustedOrigins: (request) => requestOrigins(env, request),
    advanced: {
      useSecureCookies: env.BETTER_AUTH_URL.startsWith('https://'),
      trustedProxyHeaders: true,
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
