import { createApp } from 'honox/server'
import { handleIncomingEmail } from './email'
import { createAuth } from './lib/auth'

const app = createApp({
  init(hono) {
    hono.on(['GET', 'POST'], '/api/auth/*', (c) => {
      return createAuth(c.env).handler(c.req.raw)
    })
  },
})

export default {
  fetch: app.fetch.bind(app),
  email: handleIncomingEmail,
}
