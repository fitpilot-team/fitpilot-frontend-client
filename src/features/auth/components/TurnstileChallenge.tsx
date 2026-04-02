import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    turnstile?: {
      remove?: (widgetId: string) => void
      render: (
        container: HTMLElement,
        options: {
          callback?: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
          sitekey: string
          theme?: 'light' | 'dark' | 'auto'
        },
      ) => string
    }
  }
}

let turnstileScriptPromise: Promise<void> | null = null

const loadTurnstileScript = () => {
  if (turnstileScriptPromise) {
    return turnstileScriptPromise
  }

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile-script="true"]',
    )

    if (existingScript && window.turnstile) {
      resolve()
      return
    }

    const script = existingScript ?? document.createElement('script')
    script.async = true
    script.defer = true
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.dataset.turnstileScript = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Turnstile'))

    if (!existingScript) {
      document.head.appendChild(script)
    }
  })

  return turnstileScriptPromise
}

type TurnstileChallengeProps = {
  loadErrorMessage: string
  onTokenChange: (token: string | null) => void
  siteKey: string
}

export function TurnstileChallenge({
  loadErrorMessage,
  onTokenChange,
  siteKey,
}: TurnstileChallengeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    loadTurnstileScript()
      .then(() => {
        if (
          isCancelled ||
          !containerRef.current ||
          !window.turnstile ||
          widgetIdRef.current
        ) {
          return
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          callback: (token) => {
            setLoadError(null)
            onTokenChange(token)
          },
          'error-callback': () => {
            onTokenChange(null)
            setLoadError(loadErrorMessage)
          },
          'expired-callback': () => {
            onTokenChange(null)
          },
          sitekey: siteKey,
          theme: 'light',
        })
      })
      .catch(() => {
        if (!isCancelled) {
          onTokenChange(null)
          setLoadError(loadErrorMessage)
        }
      })

    return () => {
      isCancelled = true
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [loadErrorMessage, onTokenChange, siteKey])

  if (loadError) {
    return <p className="text-sm text-red-500">{loadError}</p>
  }

  return <div ref={containerRef} />
}
