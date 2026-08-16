import { count } from 'drizzle-orm'
import { createRoute } from 'honox/factory'
import { createAuth } from '@/lib/auth'
import { createDb } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { normalizeEmail } from '@/lib/utils'

export const POST = createRoute(async (c) => {
  const db = createDb(c.env)
  const [existing] = await db.select({ value: count() }).from(user)
  if (existing?.value) {
    return c.json({ error: 'Setup is already complete' }, 403)
  }

  const body = await c.req.json<{
    name?: string
    email?: string
    password?: string
  }>()
  const name = body.name?.trim()
  const email = body.email ? normalizeEmail(body.email) : ''
  const password = body.password ?? ''

  if (!name || !email || password.length < 8) {
    return c.json({ error: 'Name, email, and an 8+ character password are required' }, 400)
  }

  const auth = createAuth(c.env, db, c.req.raw)
  const ctx = await auth.$context
  const created = await ctx.internalAdapter.createUser({
    name,
    email,
    emailVerified: true,
    role: 'admin',
  })
  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: 'credential',
    accountId: created.id,
    password: await ctx.password.hash(password),
  })

  return c.json({ ok: true })
})
