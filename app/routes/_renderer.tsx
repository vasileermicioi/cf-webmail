import { reactRenderer } from '@hono/react-renderer'
import { ClientScript, StyleLink } from '@/components/assets'

export default reactRenderer(({ children, title }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <StyleLink />
        <ClientScript />
        <title>{title ?? 'CF Webmail'}</title>
      </head>
      <body>{children}</body>
    </html>
  )
})
