import type { NotFoundHandler } from 'hono'

const handler: NotFoundHandler = (c) => {
  c.status(404)
  return c.render(
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">That route does not exist.</p>
        <a className="mt-4 inline-block text-primary underline" href="/">
          Go home
        </a>
      </div>
    </div>,
    { title: 'Not found' },
  )
}

export default handler
