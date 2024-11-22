import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode
}

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Only render the portal on the client side
  if (!mounted) return null

  // Create portal container if it doesn't exist
  let portalRoot = document.getElementById('portal-root')
  if (!portalRoot) {
    portalRoot = document.createElement('div')
    portalRoot.id = 'portal-root'
    document.body.appendChild(portalRoot)
  }

  return createPortal(children, portalRoot)
} 