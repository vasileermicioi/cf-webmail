import type { Manifest } from 'vite'

function getManifest() {
  const modules = import.meta.glob<{ default: Manifest }>('/dist/.vite/manifest.json', {
    eager: true,
  })
  for (const file of Object.values(modules)) {
    if (file.default) return file.default
  }
}

export function StyleLink() {
  const href = '/app/style.css'
  if (import.meta.env.PROD) {
    const asset = getManifest()?.[href.replace(/^\//, '')]
    if (!asset) return null
    return <link rel="stylesheet" href={`/${asset.file}`} />
  }
  return <link rel="stylesheet" href={href} />
}

export function ClientScript() {
  const src = '/app/client.ts'
  if (import.meta.env.PROD) {
    const asset = getManifest()?.[src.replace(/^\//, '')]
    if (!asset) return null
    return <script type="module" src={`/${asset.file}`} />
  }
  return <script type="module" src={src} />
}
