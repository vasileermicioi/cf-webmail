import { count } from 'drizzle-orm'
import { createRoute } from 'honox/factory'
import { user } from '@/lib/db/schema'

export default createRoute(async (c) => {
  const session = c.get('session')
  if (session) {
    return c.redirect('/inbox')
  }

  const db = c.get('db')
  const [row] = await db.select({ value: count() }).from(user)
  if (!row?.value) {
    return c.redirect('/setup')
  }

  return c.redirect('/login')
})
