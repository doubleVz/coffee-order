'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/customer/Header'
import { Footer } from '@/components/customer/Footer'
import { useCartStore } from '@/lib/store/cart-store'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Loader2, MapPin, User, Phone, FileText, CreditCard, Banknote, ShieldCheck, Armchair, Users, Sparkles, Plus, Minus, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Table } from '@/types'
import { MOCK_TABLES } from '@/lib/data/mock-data'
import { useTableStore } from '@/lib/store/table-store'
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
  const clearTable = useCartStore((s) => s.clearTable)

  const storeTables = useTableStore((s) => s.tables)
  const tables = storeTables && storeTables.length > 0 ? storeTables : MOCK_TABLES
  const addCustomerToTable = useTableStore((s) => s.addCustomerToTable)
  const occupyTable = useTableStore((s) => s.occupyTable)
  const switchTable = useTableStore((s) => s.switchTable)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'COUNTER' | 'CASH'>('COUNTER')

  // Helper tìm bàn theo ID, mã bàn (B01..) hoặc tên
  const findTable = (idOrCode: string | null | undefined): Table | undefined => {
    if (!idOrCode) return undefined
    const q = idOrCode.trim().toLowerCase()
    return tables.find(
      (t) =>
        t.id.toLowerCase() === q ||
        t.code.toLowerCase() === q ||
        t.name.toLowerCase().includes(q)
    )
  }

  // Kiểm tra xem bàn có bị kín chỗ hoàn toàn không
  const isTableFull = (t: Table | undefined): boolean => {
    if (!t) return false
    const occ = typeof t.occupied_seats === 'number' ? t.occupied_seats : 0
    return occ >= t.capacity || (t.capacity - occ) <= 0
  }

  // Khởi tạo bàn đã chọn: nếu bàn lưu trong giỏ hàng đã full, TUYỆT ĐỐI không nhận bàn đó
  const initialTable = findTable(tableId)
  const initialTableId = initialTable && !isTableFull(initialTable) ? initialTable.id : ''

  const [selectedTableId, setSelectedTableId] = useState<string>(initialTableId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Bàn đang được chọn hiện tại
  const selectedTable = findTable(selectedTableId)
  const selectedOccupied = selectedTable ? (typeof selectedTable.occupied_seats === 'number' ? selectedTable.occupied_seats : 0) : 0
  const selectedRemaining = selectedTable ? Math.max(0, selectedTable.capacity - selectedOccupied) : 0
  const isSelectedTableFull = selectedTable ? isTableFull(selectedTable) : false
  const activeTableId = selectedTable && !isSelectedTableFull ? selectedTable.id : ''

  // Tự động kiểm tra: nếu tableId trong giỏ hoặc selectedTableId bị kín chỗ, HỦY CHỌN NGAY LẬP TỨC
  useEffect(() => {
    if (tableId) {
      const tbl = findTable(tableId)
      if (tbl && isTableFull(tbl)) {
        clearTable()
        setSelectedTableId('')
        toast.error(`⛔ ${tbl.name} hiện đã kín toàn bộ ${tbl.capacity} chỗ! Hệ thống đã tự động hủy chọn bàn này. Vui lòng chọn bàn khác còn trống.`, {
          icon: '⛔',
          duration: 4000,
        })
      } else if (tbl && !selectedTableId) {
        setSelectedTableId(tbl.id)
      }
    }
  }, [tableId, tables, clearTable])

  useEffect(() => {
    if (selectedTableId) {
      const tbl = findTable(selectedTableId)
      if (tbl && isTableFull(tbl)) {
        clearTable()
        setSelectedTableId('')
        toast.error(`⛔ ${tbl.name} đã kín toàn bộ chỗ! Không thể chọn bàn này. Vui lòng chọn bàn còn chỗ trống.`, {
          icon: '⛔',
          duration: 4000,
        })
      }
    }
  }, [selectedTableId, tables, clearTable])

  // Tự động điều chỉnh số khách nếu sức chứa bàn thay đổi
  useEffect(() => {
    if (selectedTable && selectedRemaining > 0 && guestCount > selectedRemaining) {
      setGuestCount(selectedRemaining)
    }
  }, [selectedTable, selectedRemaining, guestCount])

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  const handleCustomerNameChange = (name: string) => {
    setCustomerName(name)
  }

  const handleIncreaseGuest = () => {
    if (!selectedTable) {
      toast.error('Vui lòng chọn bàn trước khi chọn số khách!', { icon: '⚠️' })
      return
    }

    if (selectedRemaining <= 0 || isSelectedTableFull) {
      toast.error(`⛔ Bàn ${selectedTable.name} đã kín toàn bộ ${selectedTable.capacity} chỗ! Không thể thêm khách. Vui lòng chọn bàn khác.`, {
        icon: '⛔',
        duration: 3500,
      })
      return
    }

    if (guestCount >= selectedRemaining) {
      toast.error(
        `⚠️ Bàn ${selectedTable.name} chỉ còn ${selectedRemaining} chỗ trống! Không thể tăng thêm quá sức chứa của bàn.`,
        {
          icon: '⚠️',
          duration: 3500,
        }
      )
      return
    }

    setGuestCount((c) => c + 1)
  }

  const handleDecreaseGuest = () => {
    if (guestCount <= 1) return
    setGuestCount((c) => c - 1)
  }

  const handleSelectTable = (tblId: string) => {
    if (!tblId) {
      setSelectedTableId('')
      clearTable()
      return
    }

    const tbl = findTable(tblId)
    if (!tbl) {
      setSelectedTableId('')
      clearTable()
      return
    }

    const occ = typeof tbl.occupied_seats === 'number' ? tbl.occupied_seats : 0
    const rem = Math.max(0, tbl.capacity - occ)

    // CHẶN TUYỆT ĐỐI NẾU BÀN ĐÃ KÍN CHỖ: KHÔNG CHO CHỌN VÀ HIỆN CẢNH BÁO
    if (rem <= 0 || isTableFull(tbl)) {
      setSelectedTableId('')
      clearTable()
      toast.error(`⛔ ${tbl.name} đã kín toàn bộ ${tbl.capacity} chỗ (Hết chỗ trống)! KHÔNG THỂ CHỌN BÀN NÀY. Vui lòng chọn bàn khác.`, {
        icon: '⛔',
        duration: 4000,
      })
      setErrors((prev) => ({
        ...prev,
        table: `${tbl.name} đã kín toàn bộ chỗ. Vui lòng chọn một bàn khác còn chỗ trống.`,
      }))
      return
    }

    setSelectedTableId(tbl.id)
    setTable(tbl.id, tbl.name)
    if (guestCount > rem) {
      setGuestCount(rem)
    }
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.table
      delete copy.guestCount
      return copy
    })
    toast.success(`Đã chọn ${tbl.name} (Hiện có ${occ}/${tbl.capacity} chỗ, còn trống ${rem} chỗ)`, {
      icon: '📍',
      duration: 3000,
    })
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!customerName.trim()) errs.customerName = 'Vui lòng nhập họ và tên của bạn'
    if (!customerPhone.trim()) {
      errs.customerPhone = 'Vui lòng nhập số điện thoại để nhận thông báo món'
    } else if (!/^(0[3|5|7|8|9])[0-9]{8}$/.test(customerPhone.trim())) {
      errs.customerPhone = 'Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09)'
    }

    if (!selectedTable || !activeTableId) {
      errs.table = 'Vui lòng chọn số bàn bạn đang ngồi (bàn còn chỗ trống)'
      toast.error('Vui lòng chọn một bàn phục vụ còn chỗ trống!', { icon: '⚠️' })
    } else {
      const occ = typeof selectedTable.occupied_seats === 'number' ? selectedTable.occupied_seats : 0
      const rem = Math.max(0, selectedTable.capacity - occ)
      if (rem <= 0 || isTableFull(selectedTable)) {
        errs.table = `CHẶN THANH TOÁN: ${selectedTable.name} đã kín toàn bộ ${selectedTable.capacity} chỗ! Bạn không thể thanh toán cho bàn này.`
        toast.error(errs.table, { icon: '⛔', duration: 4000 })
        setSelectedTableId('')
        clearTable()
      } else if (guestCount > rem) {
        errs.guestCount = `Số khách (${guestCount}) vượt quá số chỗ còn trống (${rem} chỗ) của ${selectedTable.name}`
        toast.error(errs.guestCount, { icon: '⚠️', duration: 4000 })
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    // CHẶN THANH TOÁN NGAY LẬP TỨC NẾU CHƯA CÓ BÀN HOẶC BÀN ĐÃ KÍN
    if (!activeTableId || !selectedTable) {
      toast.error('CHẶN THANH TOÁN: Vui lòng chọn một bàn phục vụ còn chỗ trống!', { icon: '⛔' })
      return
    }

    const occ = typeof selectedTable.occupied_seats === 'number' ? selectedTable.occupied_seats : 0
    const rem = Math.max(0, selectedTable.capacity - occ)

    if (rem <= 0 || isTableFull(selectedTable)) {
      toast.error(`CHẶN THANH TOÁN: ${selectedTable.name} đã kín toàn bộ ${selectedTable.capacity} chỗ (Hết chỗ trống)! Vui lòng chọn bàn khác.`, {
        icon: '⛔',
        duration: 4500,
      })
      setSelectedTableId('')
      clearTable()
      return
    }

    if (guestCount > rem) {
      toast.error(`CHẶN THANH TOÁN: Số khách (${guestCount}) vượt quá sức chứa còn lại (${rem} chỗ) của ${selectedTable.name}!`, {
        icon: '⚠️',
        duration: 4000,
      })
      return
    }

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const finalTableId = selectedTable.id
      setTable(selectedTable.id, selectedTable.name)
      // Khi đặt món thành công: cộng thêm số chỗ vào bàn (lấp đầy thêm khách)
      addCustomerToTable(finalTableId, customerName.trim() || 'Khách đặt món', guestCount)

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
                    onChange={(e) => handleCustomerNameChange(e.target.value)}
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
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-700" />
                  <h2 className="font-bold text-sm text-[#231709] uppercase tracking-wider">
                    2. Vị trí bàn phục vụ
                  </h2>
                </div>
                <Link
                  href="/check-ban"
                  target="_blank"
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80 hover:bg-amber-100 transition-colors"
                  title="Mở tab sơ đồ bàn để theo dõi chỗ trống và lấp đầy theo thời gian thực"
                >
                  <Armchair className="w-3.5 h-3.5" />
                  <span>Sơ đồ Check bàn ↗</span>
                </Link>
              </div>

              {/* Real-time synchronization notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 leading-relaxed">
                  <span className="font-bold text-amber-900">Tự động tăng số chỗ lấp đầy:</span> Khi bạn hoàn tất gọi món, số khách sẽ tự động được cộng vào số chỗ đã lấp đầy của bàn trên tab <strong>Check bàn</strong> theo thời gian thực.
                </div>
              </div>

              {/* Active Selected Table Highlight Card */}
              {selectedTable ? (
                isSelectedTableFull ? (
                  <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                          ⛔
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm font-bold text-red-950">{selectedTable.name}</strong>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-200 text-red-800">
                              ĐÃ KÍN TOÀN BỘ CHỖ (0/{selectedTable.capacity} trống)
                            </span>
                          </div>
                          <div className="text-xs text-red-800 font-semibold mt-1 flex items-center gap-2 flex-wrap">
                            <span>Tổng: <strong>{selectedTable.capacity} chỗ</strong></span>
                            <span>•</span>
                            <span>Đã lấp: <strong className="text-red-900">{selectedOccupied}/{selectedTable.capacity} chỗ</strong></span>
                            <span>•</span>
                            <span className="text-red-800 font-black">Còn trống: 0 chỗ</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-red-700 bg-white px-2.5 py-1 rounded-full border border-red-200 shadow-xs shrink-0">
                        Hết chỗ
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-red-100/90 border border-red-300 text-xs text-red-900 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                      <span>⛔ Bàn này hiện đã kín toàn bộ {selectedTable.capacity} chỗ! Vui lòng bấm chọn một bàn khác còn chỗ trống bên dưới.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                          📍
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm font-bold text-emerald-950">{selectedTable.name}</strong>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-800">
                              {selectedTable.area || 'Khu vực chung'}
                            </span>
                          </div>
                          <div className="text-xs text-emerald-800 font-semibold mt-1 flex items-center gap-3 flex-wrap">
                            <span>Tổng: <strong>{selectedTable.capacity} chỗ</strong></span>
                            <span>•</span>
                            <span>Đã lấp đầy: <strong className="text-amber-800">{selectedOccupied} chỗ</strong></span>
                            <span>•</span>
                            <span>Còn trống: <strong className="text-emerald-700 font-black">{selectedRemaining} chỗ</strong></span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-white/90 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shadow-xs shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Đã chọn
                      </span>
                    </div>

                    {/* Customer occupancy preview */}
                    {selectedTable.customers && selectedTable.customers.length > 0 && (
                      <div className="text-[11px] text-stone-600 bg-white/80 rounded-xl p-2.5 border border-emerald-200/60">
                        <span className="font-bold text-stone-700">Khách đang ngồi tại bàn: </span>
                        <span>{selectedTable.customers.join(', ')}</span>
                      </div>
                    )}

                    {/* Guest Count Selector */}
                    <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-emerald-950 block">Số khách ngồi ở đơn này:</span>
                          <span className="text-[11px] text-emerald-700 block">
                            Sức chứa còn lại của bàn: <strong>{selectedRemaining} chỗ</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-emerald-300">
                          <button
                            type="button"
                            onClick={handleDecreaseGuest}
                            disabled={guestCount <= 1}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs disabled:opacity-40 cursor-pointer"
                            title="Giảm số người"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-black text-sm text-emerald-950">{guestCount}</span>
                          <button
                            type="button"
                            onClick={handleIncreaseGuest}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                              guestCount >= selectedRemaining
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                            title={guestCount >= selectedRemaining ? `Bàn chỉ còn ${selectedRemaining} chỗ trống (đã đạt giới hạn tối đa)` : 'Tăng số người'}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Cảnh báo khi số khách đạt giới hạn số chỗ còn trống */}
                      {guestCount >= selectedRemaining && selectedRemaining > 0 && (
                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>
                            Bàn <strong>{selectedTable.name}</strong> chỉ còn <strong>{selectedRemaining} chỗ trống</strong> (đã đạt giới hạn tối đa của bàn). Không thể tăng thêm khách.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-dashed border-stone-300 text-xs text-stone-500 flex items-center gap-2 font-medium">
                  <Armchair className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>Chưa chọn bàn. Vui lòng chọn bàn bên dưới để nhân viên phục vụ đúng vị trí.</span>
                </div>
              )}

              {/* Select Dropdown */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                  Chọn bàn bạn đang ngồi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Armchair className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                  <select
                    value={activeTableId || ''}
                    onChange={(e) => handleSelectTable(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#B26A3B] transition-colors bg-white cursor-pointer font-medium text-stone-800"
                    aria-label="Chọn vị trí bàn phục vụ"
                  >
                    <option value="">-- Bấm vào đây để chọn hoặc đổi bàn còn chỗ --</option>
                    {tables.map((t) => {
                      const occ = typeof t.occupied_seats === 'number' ? t.occupied_seats : 0
                      const rem = Math.max(0, t.capacity - occ)
                      const isFull = rem <= 0 || isTableFull(t)
                      const isCurrent = !isFull && t.id === activeTableId

                      return (
                        <option
                          key={t.id}
                          value={t.id}
                          disabled={isFull}
                          className={isFull ? 'text-stone-400 bg-stone-100 font-normal' : 'font-medium'}
                        >
                          {t.name} ({t.area}) • {isFull ? `⛔ [ĐÃ KÍN ${occ}/${t.capacity} CHỖ - KHÔNG THỂ CHỌN]` : `Tổng: ${t.capacity} chỗ | Đã lấp: ${occ}/${t.capacity} | Còn: ${rem} chỗ ${isCurrent ? '★ [Đang chọn]' : ''}`}
                        </option>
                      )
                    })}
                  </select>
                </div>
                {errors.table && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.table}</p>
                )}
              </div>

              {/* Quick 1-Tap Table Selection Grid */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-700">
                    Danh sách 12 bàn (thể hiện rõ Tổng chỗ, Đã lấp và Còn trống):
                  </span>
                  <span className="text-[11px] text-stone-400">1 chạm để chọn</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {tables.map((t) => {
                    const occ = typeof t.occupied_seats === 'number' ? t.occupied_seats : 0
                    const rem = Math.max(0, t.capacity - occ)
                    const isFull = rem <= 0 || isTableFull(t)
                    const isSelected = !isFull && activeTableId === t.id
                    const isPartial = occ > 0 && !isFull

                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => {
                          if (isFull) {
                            toast.error(`⛔ ${t.name} đã kín toàn bộ ${t.capacity} chỗ! KHÔNG THỂ CHỌN BÀN NÀY. Vui lòng chọn bàn khác.`, {
                              icon: '⛔',
                              duration: 3500,
                            })
                            return
                          }
                          handleSelectTable(t.id)
                        }}
                        aria-disabled={isFull}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isFull
                            ? 'bg-stone-200/70 border-stone-300 text-stone-400 opacity-50 cursor-not-allowed select-none shadow-none grayscale hover:border-red-400'
                            : isSelected
                            ? 'bg-amber-700 text-white border-amber-800 shadow-md ring-2 ring-amber-400 cursor-pointer'
                            : isPartial
                            ? 'bg-amber-50/50 border-amber-200 text-stone-800 hover:border-amber-400 cursor-pointer'
                            : 'bg-white border-stone-200 text-stone-800 hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer'
                        }`}
                        title={isFull ? `${t.name} đã kín chỗ - Không thể chọn` : `Bấm để chọn ${t.name}`}
                      >
                        <div className="flex items-center justify-between w-full gap-1">
                          <span className={`text-xs font-bold truncate ${isFull ? 'text-stone-400 line-through' : isSelected ? 'text-white' : 'text-stone-900'}`}>
                            {t.name.split(' (')[0] || t.name}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                              isFull
                                ? 'bg-stone-300 text-stone-600'
                                : isSelected
                                ? 'bg-amber-900 text-white'
                                : isPartial
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isFull ? '⛔ ĐÃ KÍN' : isSelected ? 'Đang chọn' : isPartial ? 'Có khách' : 'Trống'}
                          </span>
                        </div>

                        {/* Detailed Seat Counts */}
                        <div className="my-2 space-y-1">
                          <div className={`flex items-center justify-between text-[11px] font-semibold ${isSelected ? 'text-amber-100' : isFull ? 'text-stone-400' : 'text-stone-600'}`}>
                            <span>Tổng: <strong>{t.capacity} chỗ</strong></span>
                            <span>Đã lấp: <strong className={isSelected ? 'text-white' : isFull ? 'text-stone-500' : isPartial ? 'text-amber-800' : 'text-emerald-700'}>{occ}/{t.capacity}</strong></span>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className="w-full h-1.5 rounded-full bg-black/10 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isSelected
                                  ? 'bg-white'
                                  : isFull
                                  ? 'bg-stone-400'
                                  : isPartial
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, (occ / t.capacity) * 100)}%` }}
                            />
                          </div>

                          <div className={`text-[10px] text-right font-medium ${isSelected ? 'text-amber-200' : isFull ? 'text-stone-400 font-bold' : 'text-emerald-700'}`}>
                            {isFull ? '⛔ Hết chỗ trống' : `Còn trống ${rem} chỗ`}
                          </div>
                        </div>

                        <div className={`flex items-center justify-between text-[10px] pt-1.5 border-t ${isSelected ? 'border-amber-600/60 text-amber-200' : 'border-stone-100 text-stone-400'}`}>
                          <span className="truncate max-w-[80px]">{t.area}</span>
                          <span className="flex items-center gap-0.5 shrink-0">
                            <Users className="w-3 h-3" />
                            {t.capacity} chỗ
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
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

              {/* Cảnh báo chặn thanh toán */}
              {(!selectedTable || isSelectedTableFull || selectedRemaining <= 0) && (
                <div className="p-3.5 rounded-2xl bg-red-100 border-2 border-red-400 text-xs text-red-950 font-bold space-y-1">
                  <div className="flex items-center gap-2 text-red-700 font-black">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>CHẶN THANH TOÁN:</span>
                  </div>
                  <p className="font-semibold text-red-900 leading-relaxed">
                    {selectedTable
                      ? `Bàn ${selectedTable.name} hiện đã kín toàn bộ chỗ (${selectedOccupied}/${selectedTable.capacity}). Bạn không thể thanh toán cho bàn này!`
                      : 'Bạn chưa chọn bàn phục vụ còn chỗ trống. Vui lòng bấm chọn một bàn còn chỗ trống bên dưới để gọi món.'}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedTable || isSelectedTableFull || selectedRemaining <= 0}
                className={`w-full h-13 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                  !selectedTable || isSelectedTableFull || selectedRemaining <= 0
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none border border-stone-300'
                    : 'bg-gradient-to-r from-[#654321] to-[#B26A3B] text-white shadow-amber-950/20 hover:opacity-95 active:scale-98'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang gửi đơn hàng...
                  </>
                ) : !selectedTable ? (
                  'VUI LÒNG CHỌN BÀN CÒN TRỐNG 📍'
                ) : isSelectedTableFull || selectedRemaining <= 0 ? (
                  '⛔ BÀN ĐÃ KÍN CHỖ - CHẶN THANH TOÁN'
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
