import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import type { Db } from './db'
import { createDb } from './db'
import * as schema from './db/schema'

function isLocalHost(host: string) {
  return (
    host === 'localhost' ||
    host.startsWith('localhost:') ||
    host === '127.0.0.1' ||
    host.startsWith('127.0.0.1:') ||
    host === '::1'
  )
}

function authBaseURL(env: CloudflareBindings) {
  const allowedHosts = [
    'localhost',
    'localhost:*',
    '127.0.0.1',
    '127.0.0.1:*',
    '*.workers.dev',
  ]

  if (env.BETTER_AUTH_URL) {
    try {
      const url = new URL(env.BETTER_AUTH_URL)
      allowedHosts.push(url.host, url.hostname)
    } catch {
      // ignore invalid BETTER_AUTH_URL
    }
  }

  return {
    allowedHosts,
    fallback: env.BETTER_AUTH_URL,
    protocol: 'auto' as const,
  }
}

function requestOrigins(env: CloudflareBindings, request?: Request) {
  const origins = new Set<string>()
  if (env.BETTER_AUTH_URL) origins.add(env.BETTER_AUTH_URL)
  if (!request) return [...origins]

  try {
    origins.add(new URL(request.url).origin)
  } catch {
    // ignore invalid request URLs
  }

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (host) {
    const proto =
      request.headers.get('x-forwarded-proto') ?? (isLocalHost(host) ? 'http' : 'https')
    origins.add(`${proto}://${host}`)
  }

  const originHeader = request.headers.get('origin')
  if (originHeader) {
    try {
      const originUrl = new URL(originHeader)
      if (isLocalHost(originUrl.host) || originUrl.hostname.endsWith('.workers.dev')) {
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
    baseURL: authBaseURL(env),
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
      useSecureCookies: env.BETTER_AUTH_URL
        ? !isLocalHost(new URL(env.BETTER_AUTH_URL).host)
        : true,
      trustedProxyHeaders: true,
    },
  })
}

export type Auth = ReturnType<typeof createAuth>
