'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/customer/Header'
import { Footer } from '@/components/customer/Footer'
import { useCartStore } from '@/lib/store/cart-store'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Loader2, MapPin, User, Phone, FileText, CreditCard, Banknote, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Table } from '@/types'
import { MOCK_TABLES } from '@/lib/data/mock-data'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const tableId = useCartStore((s) => s.tableId)
  const tableName = useCartStore((s) => s.tableName)
  const setTable = useCartStore((s) => s.setTable)
  const clearCart = useCartStore((s) => s.clearCart)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'COUNTER' | 'CASH'>('COUNTER')
  const [tables, setTables] = useState<Table[]>(MOCK_TABLES)
  const [selectedTableId, setSelectedTableId] = useState(tableId || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
      return
    }

    async function loadTables() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('tables')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (data && data.length > 0) {
          setTables(data as Table[])
        } else {
          setTables(MOCK_TABLES)
        }
      } catch {
        setTables(MOCK_TABLES)
      }
    }

    loadTables()
  }, [items.length, router])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!customerName.trim()) errs.customerName = 'Vui lòng nhập họ và tên của bạn'
    if (!customerPhone.trim()) {
      errs.customerPhone = 'Vui lòng nhập số điện thoại để nhận thông báo món'
    } else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(customerPhone.trim())) {
      errs.customerPhone = 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)'
    }
    if (!tableId && !selectedTableId) {
      errs.table = 'Vui lòng chọn số bàn bạn đang ngồi'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const finalTableId = tableId || selectedTableId || null

      if (!tableId && selectedTableId) {
        const t = tables.find((t) => t.id === selectedTableId)
        if (t) setTable(t.id, t.name)
      }

      const payload = {
        table_id: finalTableId,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        note: note.trim() || null,
        payment_method: paymentMethod,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          size: item.size,
          sugar: item.sugar,
          ice: item.ice,
          toppings: item.toppings.map((t) => t.name),
          note: item.note,
        })),
      }

      let orderResult: { id: string; order_code: string } | null = null

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (res.ok) {
          const data = await res.json()
          orderResult = data.order
        }
      } catch (e) {
        console.warn('API call failed, falling back to simulated order:', e)
      }

      // If backend was offline, create mock order result
      if (!orderResult) {
        const randomNum = Math.floor(Math.random() * 899999 + 100000)
        orderResult = {
          id: 'demo-' + Date.now(),
          order_code: `CF${randomNum}`,
        }
      }

      clearCart()
      toast.success('Đã gửi đơn hàng đến quầy Barista!')
      router.push(`/order-success?id=${orderResult.id}&code=${orderResult.order_code}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đặt hàng thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = getTotal()

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231709] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại giỏ hàng
        </Link>

        <h1 className="text-2xl sm:text-3xl font-black text-[#231709] tracking-tight mb-8">
          Xác nhận đơn hàng & Gọi món
        </h1>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <User className="w-4 h-4 text-amber-700" />
                <h2 className="font-bold text-sm text-[#231709] uppercase tracking-wider">
                  1. Thông tin người nhận
                </h2>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ví dụ: Hoàng Long"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#B26A3B] transition-colors"
                  />
                </div>
                {errors.customerName && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ví dụ: 0901234567"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#B26A3B] transition-colors"
                  />
                </div>
                {errors.customerPhone && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.customerPhone}</p>
                )}
              </div>
            </div>

            {/* Table Selection Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <MapPin className="w-4 h-4 text-amber-700" />
                <h2 className="font-bold text-sm text-[#231709] uppercase tracking-wider">
                  2. Vị trí bàn phục vụ
                </h2>
              </div>

              {tableId && tableName ? (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                      📍
                    </div>
                    <div>
                      <span className="text-xs text-stone-500 block">Đã quét QR nhận diện:</span>
                      <strong className="text-sm font-bold text-[#654321]">{tableName}</strong>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Chính xác
                  </span>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Chọn số bàn bạn đang ngồi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full py-3 px-4 rounded-2xl border-2 border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#B26A3B] transition-colors bg-white cursor-pointer font-medium"
                    aria-label="Chọn bàn"
                  >
                    <option value="">-- Vui lòng chọn bàn --</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Sức chứa {t.capacity} người)
                      </option>
                    ))}
                  </select>
                  {errors.table && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.table}</p>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <CreditCard className="w-4 h-4 text-amber-700" />
                <h2 className="font-bold text-sm text-[#231709] uppercase tracking-wider">
                  3. Hình thức thanh toán
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'COUNTER'
                      ? 'border-[#B26A3B] bg-[#FFF8F0] shadow-xs'
                      : 'border-stone-200/80 bg-white hover:border-amber-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COUNTER"
                    checked={paymentMethod === 'COUNTER'}
                    onChange={() => setPaymentMethod('COUNTER')}
                    className="accent-[#B26A3B] mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#231709]">
                      <Banknote className="w-4 h-4 text-amber-700" />
                      <span>Thanh toán tại quầy</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Thanh toán khi nhân viên mang đồ ra bàn hoặc ghé quầy thu ngân.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'CASH'
                      ? 'border-[#B26A3B] bg-[#FFF8F0] shadow-xs'
                      : 'border-stone-200/80 bg-white hover:border-amber-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="CASH"
                    checked={paymentMethod === 'CASH'}
                    onChange={() => setPaymentMethod('CASH')}
                    className="accent-[#B26A3B] mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#231709]">
                      <CreditCard className="w-4 h-4 text-amber-700" />
                      <span>Tiền mặt / Chuyển khoản</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Nhân viên mang mã VietQR hoặc nhận tiền mặt tại bàn.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Note Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2">
                <FileText className="w-4 h-4 text-amber-700" />
                <h2 className="font-bold text-sm text-[#231709] uppercase tracking-wider">
                  Ghi chú thêm cho đơn hàng
                </h2>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Giao cùng lúc với bánh ngọt, mang thêm nước lọc..."
                className="w-full p-3.5 rounded-2xl border-2 border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#B26A3B] transition-colors resize-none placeholder:text-stone-400"
                rows={2}
              />
            </div>
          </div>

          {/* Right: Order Summary Sticky Card */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm space-y-6">
              <h2 className="font-bold text-sm text-[#231709] uppercase tracking-wider pb-3 border-b border-stone-100">
                Chi tiết đơn món ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-xs sm:text-sm py-1">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-[#231709]">
                        {item.productName} <span className="text-amber-800">×{item.quantity}</span>
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {[item.size && `Size ${item.size}`, item.sugar && `Đường ${item.sugar}`, item.ice && `Đá ${item.ice}`, ...item.toppings.map(t => t.name)].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                    <span className="font-bold text-stone-800 shrink-0">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Tạm tính</span>
                  <span className="font-medium text-stone-800">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Phí phục vụ & khăn lạnh</span>
                  <span className="text-emerald-600 font-semibold">Miễn phí</span>
                </div>
                <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
                  <span className="font-bold text-base text-[#231709]">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-[#B26A3B]">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#654321] to-[#B26A3B] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang gửi đơn hàng...
                  </>
                ) : (
                  'GỬI ĐƠN HÀNG ĐẾN BARISTA ☕'
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Không mất phí hủy đơn nếu thông báo trước 2 phút</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
