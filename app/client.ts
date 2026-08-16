import './style.css'
import { createClient } from 'honox/client'

createClient({
  hydrate: async (elem, root) => {
    const { hydrateRoot } = await import('react-dom/client')
    hydrateRoot(root, elem)
  },
  createElement: async (type: string, props: Record<string, unknown>) => {
    const { createElement } = await import('react')
    return createElement(type, props)
  },
})
