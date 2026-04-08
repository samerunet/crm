import GuidePurchaseFinalizer from '@/components/GuidePurchaseFinalizer'

export const metadata = { title: 'Thanks' }

export default async function Page({ searchParams }:{
  searchParams: Promise<{ session_id?: string, payment_intent?: string, redirect_status?: string, email?: string }>
}) {
  const p = await searchParams
  const status = p.redirect_status || 'succeeded'
  return (
    <div className="f-container section-y">
      <div className="glass rounded-[var(--radius-xl)] p-10 md:p-14">
        <h1 className="text-3xl font-semibold mb-4">Thank you!</h1>
        <p className="opacity-90 mb-4">
          Your payment {status === 'succeeded' ? 'was successful' : `status: ${status}`}. Your guide should download automatically, and we&apos;ll also send a backup link by email.
        </p>
        <div className="mb-4">
          <GuidePurchaseFinalizer sessionId={p.session_id} />
        </div>
        <a href="/" className="gbtn inline-block rounded-[var(--radius)] px-4 py-2">Go Home</a>
      </div>
    </div>
  )
}
