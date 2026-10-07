'use client'

import { MapPin, QrCode } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'

export function TableBanner() {
  const tableName = useCartStore((s) => s.tableName)

  if (tableName) {
    return (
      <div className="mb-6 bg-amber-50/90 border border-amber-300/80 rounded-2xl px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs text-stone-500 block leading-tight">Vị trí phục vụ đã chọn:</span>
            <strong className="text-sm font-bold text-amber-950">{tableName}</strong>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Giao tận bàn ⚡
        </span>
      </div>
    )
  }

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
