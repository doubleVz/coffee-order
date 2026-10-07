'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle2, Coffee, ArrowRight, Clock, Sparkles } from 'lucide-react'
import { Header } from '@/components/customer/Header'
import { Footer } from '@/components/customer/Footer'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const orderCode = searchParams.get('code')

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231709] flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="text-center max-w-lg w-full bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 shadow-xl coffee-card-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-amber-500 to-[#B26A3B]" />

          <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-25" />
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full flex items-center justify-center shadow-lg text-white">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Đơn hàng đã được tiếp nhận
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#231709] tracking-tight">
            Đặt món thành công!
          </h1>

          {orderCode && (
            <div className="mt-4 p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 max-w-xs mx-auto">
              <span className="text-[11px] font-semibold text-stone-500 block">Mã đơn hàng của bạn</span>
              <span className="text-xl font-black text-[#B26A3B] tracking-wider">#{orderCode}</span>
            </div>
          )}

          <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            Barista tại quầy đang bắt đầu pha chế đồ uống cho bạn. Thời gian hoàn thành dự kiến từ <strong>3 - 5 phút</strong>.
          </p>

          <div className="mt-4 p-3 bg-stone-50 rounded-2xl text-[11px] text-stone-500 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Vui lòng ngồi tại bàn hoặc lắng nghe số thứ tự</span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {orderId && (
              <Link
                href={`/order/${orderId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#654321] to-[#B26A3B] text-white font-bold text-xs sm:text-sm shadow-md hover:scale-102 active:scale-98 transition-all"
              >
                Theo dõi tiến độ đơn hàng
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm transition-all"
            >
              <Coffee className="h-4 w-4" />
              Gọi thêm món khác
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <Coffee className="h-10 w-10 text-amber-700 animate-pulse" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  )
}
