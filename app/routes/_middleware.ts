import { createRoute } from 'honox/factory'
import { createAuth } from '@/lib/auth'
import { createDb } from '@/lib/db'

export default createRoute(async (c, next) => {
  const db = createDb(c.env)
  const auth = createAuth(c.env, db, c.req.raw)
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })
  c.set('db', db)
  c.set('auth', auth)
  c.set('session', session)
  await next()
})
