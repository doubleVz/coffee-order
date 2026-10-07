'use client'

import { Header } from '@/components/customer/Header'
import { Footer } from '@/components/customer/Footer'
import { useCartStore } from '@/lib/store/cart-store'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, MapPin, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const getTotal = useCartStore((s) => s.getTotal)
  const tableName = useCartStore((s) => s.tableName)

  const total = getTotal()

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231709] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Tiếp tục chọn thêm món
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#231709] tracking-tight">
            Giỏ hàng của bạn
          </h1>
          {tableName && (
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 rounded-2xl px-3.5 py-1.5 text-xs font-semibold text-amber-900 shadow-xs">
              <MapPin className="h-4 w-4 text-amber-700" />
              <span>Đang gọi món tại <strong className="text-amber-800">{tableName}</strong></span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto mb-4 text-[#B26A3B]">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-[#231709]">Giỏ hàng của bạn đang trống</h2>
            <p className="mt-2 text-xs sm:text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
              Bạn chưa chọn món nào. Hãy ghé xem thực đơn cà phê thơm lừng và bánh ngọt nướng mới nhé!
            </p>
            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#654321] text-white text-xs sm:text-sm font-bold hover:bg-[#523518] shadow-md transition-all"
            >
              Xem Thực Đơn Ngay ☕
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-7 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 flex gap-4 coffee-card-shadow transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        ☕
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#231709] text-sm sm:text-base line-clamp-1">
                          {item.productName}
                        </h3>
                        <button
                          onClick={() => {
                            removeItem(item.id)
                            toast.success(`Đã xóa ${item.productName} khỏi giỏ`)
                          }}
                          className="p-1 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          aria-label="Xóa món"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Options Pills */}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.size && (
                          <span className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                            Size {item.size}
                          </span>
                        )}
                        {item.sugar && (
                          <span className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                            {item.sugar} đường
                          </span>
                        )}
                        {item.ice && (
                          <span className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                            {item.ice} đá
                          </span>
                        )}
                        {item.toppings.map((t) => (
                          <span
                            key={t.name}
                            className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md"
                          >
                            +{t.name}
                          </span>
                        ))}
                      </div>

                      {item.note && (
                        <p className="mt-1.5 text-[11px] text-stone-400 italic">
                          📝 {item.note}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-[#B26A3B]">
                        {formatCurrency(item.unitPrice)}
                      </span>

                      {/* Stepper */}
                      <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition-all"
                          aria-label="Giảm"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-[#231709]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition-all"
                          aria-label="Tăng"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="lg:col-span-5 sticky top-28">
              <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-[#231709] uppercase tracking-wider">
                    Thông tin thanh toán
                  </h3>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Số lượng món ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                    <span className="font-semibold text-stone-800">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Phí phục vụ & VAT</span>
                    <span className="text-emerald-600 font-semibold">Miễn phí (0 ₫)</span>
                  </div>
                  <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                    <span className="font-bold text-[#231709] text-base">Tổng thanh toán</span>
                    <span className="text-2xl font-black text-[#B26A3B]">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#654321] to-[#B26A3B] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 hover:opacity-95 active:scale-98 transition-all"
                >
                  TIẾN HÀNH ĐẶT MÓN
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                  Quý khách có thể kiểm tra lại thông tin bàn và phương thức thanh toán tại bước tiếp theo.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
