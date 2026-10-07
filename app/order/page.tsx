'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import OrderTrackingClient from './[id]/OrderTrackingClient'
import { Coffee } from 'lucide-react'

function OrderQueryContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id') || 'demo'
  return <OrderTrackingClient orderId={orderId} />
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <Coffee className="h-10 w-10 text-amber-700 animate-pulse" />
        </div>
      }
    >
      <OrderQueryContent />
    </Suspense>
  )
}
