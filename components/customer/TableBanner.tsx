'use client'

import { MapPin, QrCode } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'

export function TableBanner() {
  const tableName = useCartStore((s) => s.tableName)



  return (
    <div className="mb-6 bg-white border border-stone-200/80 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-stone-500 shadow-xs">
      <div className="flex items-center gap-2">
        <QrCode className="h-4 w-4 text-amber-700 shrink-0" />
        <span>
          Mẹo: Quét mã QR trên bàn để tự động gán vị trí nhận món hoặc chọn bàn tại bước thanh toán.
        </span>
      </div>
    </div>
  )
}
