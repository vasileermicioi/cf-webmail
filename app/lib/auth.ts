import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import type { Db } from './db'
import { createDb } from './db'
import * as schema from './db/schema'

function isLocalHost(host: string) {
  const hostname = host.replace(/:\d+$/, '')
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export function originFromRequest(request?: Request, fallback?: string) {
  if (request) {
    const url = new URL(request.url)
    const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host
    const proto =
      request.headers.get('x-forwarded-proto') ??
      (isLocalHost(host) ? 'http' : url.protocol.replace(':', '') || 'https')
    return `${proto}://${host}`
  }
  return fallback
}

function requestOrigins(env: CloudflareBindings, request?: Request, baseURL?: string) {
  const origins = new Set<string>()
  if (baseURL) origins.add(baseURL)
  if (env.BETTER_AUTH_URL) origins.add(env.BETTER_AUTH_URL)

  if (!request) return [...origins]

  const requestOrigin = originFromRequest(request)
  if (requestOrigin) origins.add(requestOrigin)

  const originHeader = request.headers.get('origin')
  if (originHeader && requestOrigin && originHeader === requestOrigin) {
    origins.add(originHeader)
  }

  return [...origins]
}

export function createAuth(env: CloudflareBindings, db?: Db, request?: Request) {
  const database = db ?? createDb(env)
  const baseURL = originFromRequest(request, env.BETTER_AUTH_URL)

  return betterAuth({
    appName: 'CF Webmail',
    baseURL,
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
    trustedOrigins: (incoming) => requestOrigins(env, incoming ?? request, baseURL),
    advanced: {
      useSecureCookies: Boolean(baseURL?.startsWith('https://')),
      trustedProxyHeaders: true,
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
