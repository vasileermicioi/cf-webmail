import { createRoute } from 'honox/factory'

export default createRoute(async (c, next) => {
  if (!c.get('session')) {
    return c.redirect('/login')
  }
  await next()
})
