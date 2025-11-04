'use client'
import Script from 'next/script'
import * as React from 'react'

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

export default function BuyButton({
  buyButtonId,
  publishableKey,
}: {
  buyButtonId: string
  publishableKey: string
}) {
  return (
    <>
      <Script src="https://js.stripe.com/v3/buy-button.js" strategy="afterInteractive" />
      <stripe-buy-button
        suppressHydrationWarning
        buy-button-id={buyButtonId}
        publishable-key={publishableKey}
      />
    </>
  )
}
