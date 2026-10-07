'use client'

import Link from 'next/link'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { formatCurrency } from '@/lib/utils'

export function CartFloatingButton() {
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const getItemCount = useCartStore((s) => s.getItemCount)
  const tableName = useCartStore((s) => s.tableName)

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 md:left-auto md:right-8 md:max-w-md animate-in fade-in slide-in-from-bottom duration-300">
      <Link
        href="/cart"
        className="flex items-center justify-between bg-gradient-to-r from-[#231709] via-[#382314] to-[#654321] text-white rounded-3xl p-4 sm:px-6 shadow-2xl shadow-amber-950/40 border border-amber-600/30 hover:scale-102 active:scale-98 transition-all group"
      >
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-200">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-amber-600 text-white text-[11px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
              {getItemCount()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white">Giỏ hàng của bạn</span>
              {tableName && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                  {tableName}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-300">
              {getItemCount()} món • Nhấn để xem lại
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-black text-base sm:text-lg text-amber-300">
            {formatCurrency(getTotal())}
          </span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </div>
  )
}
export default CartFloatingButton
