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

function hostsFromUrl(urlString?: string) {
  if (!urlString) return []
  try {
    const { host, hostname } = new URL(urlString)
    const hosts = [host, hostname]
    const parts = hostname.split('.').filter(Boolean)
    if (parts.length >= 2) {
      const root = parts.slice(-2).join('.')
      hosts.push(root, `*.${root}`)
    }
    return hosts
  } catch {
    return []
  }
}

function extraAllowedHosts(env: CloudflareBindings) {
  return (env.BETTER_AUTH_ALLOWED_HOSTS ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
}

function allowedHosts(env: CloudflareBindings) {
  return [
    'localhost',
    'localhost:*',
    '127.0.0.1',
    '127.0.0.1:*',
    ...hostsFromUrl(env.BETTER_AUTH_URL),
    ...extraAllowedHosts(env),
  ]
}

function authBaseURL(env: CloudflareBindings) {
  return {
    allowedHosts: allowedHosts(env),
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
      const allowed = new Set(allowedHosts(env))
      if (
        isLocalHost(originUrl.host) ||
        allowed.has(originUrl.host) ||
        allowed.has(originUrl.hostname) ||
        [...allowed].some(
          (pattern) =>
            pattern.startsWith('*.') && originUrl.hostname.endsWith(pattern.slice(1)),
        )
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
