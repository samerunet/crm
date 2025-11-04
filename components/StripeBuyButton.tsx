'use client'
import React, { useEffect, useState } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'buy-button-id': string
        'publishable-key': string
      }
    }
  }
}

type Props = {
  buyButtonId: string
  publishableKey: string
}

export default function StripeBuyButton({ buyButtonId, publishableKey }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = 'stripe-buy-button-js'
    if (document.getElementById(id)) { setReady(true); return }
    const s = document.createElement('script')
    s.id = id
    s.src = 'https://js.stripe.com/v3/buy-button.js'
    s.async = true
    s.onload = () => setReady(true)
    document.head.appendChild(s)
  }, [])

  if (!ready) return <div style={{ height: 56 }} aria-busy="true" />

  return (
    <div suppressHydrationWarning>
      <stripe-buy-button
        buy-button-id={buyButtonId}
        publishable-key={publishableKey}
      />
    </div>
  )
}
