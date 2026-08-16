import type { ErrorHandler } from 'hono'

const handler: ErrorHandler = (error, c) => {
  if ('getResponse' in error && typeof error.getResponse === 'function') {
    return error.getResponse()
  }

  console.error(error)
  return c.render(
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>
        <a className="mt-4 inline-block text-primary underline" href="/">
          Go home
        </a>
      </div>
    </div>,
    { title: 'Error' },
  )
}

export default handler
