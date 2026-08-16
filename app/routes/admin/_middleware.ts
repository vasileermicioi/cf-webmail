import { createRoute } from 'honox/factory'
import { isAdminRole } from '@/lib/utils'

export default createRoute(async (c, next) => {
  const session = c.get('session')
  if (!session) {
    return c.redirect('/login')
  }
  if (!isAdminRole(session.user.role)) {
    return c.redirect('/inbox')
  }
  await next()
})
