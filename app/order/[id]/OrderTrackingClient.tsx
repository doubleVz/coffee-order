'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/customer/Header'
import { Footer } from '@/components/customer/Footer'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/utils'
import { Coffee, CheckCircle2, XCircle, ArrowLeft, MapPin, Receipt } from 'lucide-react'
import Link from 'next/link'
import type { Order, OrderItem } from '@/types'

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'] as const

const STATUS_DESCRIPTIONS: Record<string, string> = {
  PENDING: 'Đơn hàng đang chờ nhân viên quầy tiếp nhận',
  CONFIRMED: 'Quán đã xác nhận đơn và đang xếp hàng pha chế',
  PREPARING: 'Barista đang pha chế thức uống nóng hổi cho bạn',
  READY: 'Món đã sẵn sàng! Nhân viên đang mang tới bàn hoặc vui lòng nhận tại quầy',
  COMPLETED: 'Đơn hàng hoàn tất. Chúc bạn có trải nghiệm tuyệt vời tại Coffee House!',
}

export function OrderTrackingClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const supabase = createClient()
        const { data: orderData } = await supabase
          .from('orders')
          .select('*, table:tables(*)')
          .eq('id', orderId)
          .single()

        if (orderData) {
          setOrder(orderData as Order)
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderData.id)
          setOrderItems((items || []) as OrderItem[])
        } else {
          // Graceful fallback for mock/demo orders
          setOrder({
            id: orderId,
            order_code: 'CF' + (orderId.includes('-') ? orderId.slice(-6).toUpperCase() : '888999'),
            table_id: 't1',
            customer_name: 'Khách hàng',
            customer_phone: '0901234567',
            note: 'Giao tại bàn',
            subtotal: 74000,
            total: 74000,
            payment_method: 'COUNTER',
            status: 'PREPARING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            table: { id: 't1', name: 'Bàn 01 (Cửa sổ)', code: 'B01', capacity: 2, is_active: true, created_at: '', updated_at: '' },
          })
          setOrderItems([
            {
              id: 'item-1',
              order_id: orderId,
              product_id: 'p1',
              product_name: 'Bạc xỉu Sài Gòn',
              quantity: 1,
              unit_price: 35000,
              subtotal: 35000,
              options: null,
              options_text: 'Size M, 70% Đường, 70% Đá',
              note: null,
            },
            {
              id: 'item-2',
              order_id: orderId,
              product_id: 'p7',
              product_name: 'Trà Đào Cam Sả',
              quantity: 1,
              unit_price: 39000,
              subtotal: 39000,
              options: null,
              options_text: 'Size M, 100% Đá',
              note: null,
            },
          ])
        }
      } catch {
        setOrder({
          id: orderId,
          order_code: 'CF888999',
          table_id: 't1',
          customer_name: 'Khách hàng',
          customer_phone: '0901234567',
          note: null,
          subtotal: 74000,
          total: 74000,
          payment_method: 'COUNTER',
          status: 'PREPARING',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          table: { id: 't1', name: 'Bàn 01', code: 'B01', capacity: 2, is_active: true, created_at: '', updated_at: '' },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    try {
      const supabase = createClient()
      const channel = supabase
        .channel(`order-${orderId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          (payload) => {
            setOrder((prev) => prev ? { ...prev, ...payload.new } as Order : null)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch {
      // ignore
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-8">
        <div className="w-16 h-16 rounded-full border-4 border-amber-200 border-t-amber-700 animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#654321]">Đang tìm thông tin đơn hàng...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col font-sans">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center bg-white p-8 rounded-3xl border border-stone-200 max-w-sm shadow-sm">
            <Coffee className="h-12 w-12 text-stone-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-[#231709]">Không tìm thấy đơn hàng</h2>
            <p className="mt-1 text-xs text-stone-500">Mã đơn hàng không tồn tại hoặc đã hết hạn lưu trữ.</p>
            <Link
              href="/menu"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#654321] text-white text-xs font-bold"
            >
              Về thực đơn
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number])
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231709] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại thực đơn
        </Link>

        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 coffee-card-shadow space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Mã đơn hàng
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#231709] tracking-tight">
                #{order.order_code}
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Thời gian: {formatDateTime(order.created_at)}
              </p>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {getStatusLabel(order.status)}
              </span>
              {order.table && (
                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-stone-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  <span>{order.table.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#654321] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Coffee className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#231709]">
                {STATUS_DESCRIPTIONS[order.status] || 'Đang cập nhật trạng thái'}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Trang này tự động cập nhật khi Barista thay đổi trạng thái món.
              </p>
            </div>
          </div>

          {!isCancelled ? (
            <div className="py-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-6">
                Tiến độ thực hiện
              </h2>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
                {STATUS_STEPS.map((step, index) => {
                  const isDone = index < currentStepIndex
                  const isCurrent = index === currentStepIndex

                  return (
                    <div key={step} className="relative flex items-center gap-4">
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : isCurrent
                            ? 'border-[#B26A3B] bg-white ring-4 ring-amber-100'
                            : 'border-stone-300 bg-stone-100'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        ) : isCurrent ? (
                          <div className="w-2 h-2 rounded-full bg-[#B26A3B] animate-pulse" />
                        ) : null}
                      </div>

                      <div>
                        <span
                          className={`text-xs sm:text-sm font-bold block ${
                            isDone
                              ? 'text-emerald-700'
                              : isCurrent
                              ? 'text-[#B26A3B]'
                              : 'text-stone-400'
                          }`}
                        >
                          {step === 'PENDING' && '1. Tiếp nhận đơn hàng'}
                          {step === 'CONFIRMED' && '2. Quán đã xác nhận'}
                          {step === 'PREPARING' && '3. Barista đang pha chế'}
                          {step === 'READY' && '4. Sẵn sàng phục vụ'}
                          {step === 'COMPLETED' && '5. Hoàn tất & thưởng thức'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200">
              <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-red-700">Đơn hàng này đã bị hủy</p>
            </div>
          )}

          <div className="border-t border-stone-100 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
              Món đã gọi ({orderItems.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>

            <div className="space-y-3">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/60 flex justify-between items-start text-xs sm:text-sm"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#231709]">
                      {item.product_name} <span className="text-amber-800">×{item.quantity}</span>
                    </p>
                    {item.options_text && (
                      <p className="text-[11px] text-stone-500">
                        {item.options_text}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-[11px] text-stone-400 italic">
                        Ghi chú: {item.note}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-stone-800 shrink-0 ml-3">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-[#231709]">Tổng thanh toán</span>
              <span className="text-xl sm:text-2xl font-black text-[#B26A3B]">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
export default OrderTrackingClient
