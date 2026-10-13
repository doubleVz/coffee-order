'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Lock,
  Unlock,
  Coffee,
  Clock,
  Volume2,
  VolumeX,
  Key,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ChefHat,
  BellRing,
  MapPin,
  User,
  ArrowLeft,
  X,
  ShieldCheck,
  Check,
  Sparkles,
  Timer,
  AlertTriangle,
} from 'lucide-react'
import { useOrderStore, playBaristaChime } from '@/lib/store/order-store'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import type { Order, OrderItem, OrderStatus } from '@/types'
import toast, { Toaster } from 'react-hot-toast'

const getOrderItems = (order: Order): OrderItem[] => order.items || order.order_items || []

const getPaymentLabel = (method: string) => {
  if (method === 'CASH') return 'Tiền mặt'
  if (method === 'MOMO') return 'MoMo'
  if (method === 'VNPAY') return 'VNPay'
  if (method === 'COUNTER') return 'Tại quầy'
  return method || 'Tại quầy'
}

export default function BaristaPage() {
  const [hasMounted, setHasMounted] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // Modal đổi mã PIN
  const [showPinModal, setShowPinModal] = useState(false)
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmNewPin, setConfirmNewPin] = useState('')
  const [modalError, setModalError] = useState('')
  const [modalSuccess, setModalSuccess] = useState('')

  const {
    orders,
    isBaristaAuthenticated,
    soundEnabled,
    loginBarista,
    logoutBarista,
    changeBaristaPin,
    toggleSound,
    updateOrderStatus,
    resetToMockOrders,
  } = useOrderStore()

  useEffect(() => {
    setHasMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Đồng bộ kiểm tra định kỳ mỗi 1 giây (đảm bảo cập nhật tức thì nếu tab Barista ở nền)
    const syncInterval = setInterval(() => {
      useOrderStore.getState().syncOrdersFromStorage()
    }, 1000)

    // Lắng nghe sự kiện thông báo có đơn mới từ thu ngân gửi đến
    const handleNewOrder = (e: Event) => {
      const order = (e as CustomEvent<Order>).detail
      if (order) {
        toast(
          (t) => (
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">☕</span>
              <div>
                <p className="font-bold text-xs text-amber-950 uppercase tracking-wide">
                  🔔 CÓ ĐƠN HÀNG MỚI ĐẾN!
                </p>
                <p className="text-xs text-stone-700 font-medium">
                  #{order.order_code} • {order.table?.name || 'Tại quầy'}
                </p>
              </div>
            </div>
          ),
          {
            duration: 6000,
            style: {
              background: '#FFF8E7',
              color: '#3B2416',
              border: '2px solid #D48D55',
              borderRadius: '1rem',
              boxShadow: '0 10px 25px -5px rgba(178, 106, 59, 0.3)',
            },
          }
        )
      }
    }

    window.addEventListener('coffee:new-order', handleNewOrder)

    return () => {
      clearInterval(timer)
      clearInterval(syncInterval)
      window.removeEventListener('coffee:new-order', handleNewOrder)
    }
  }, [])

  // Xử lý nhập PIN bằng bàn phím vật lý khi ở màn hình khóa
  useEffect(() => {
    if (!hasMounted || isBaristaAuthenticated) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        if (pinInput.length < 6) {
          handlePinPress(e.key)
        }
      } else if (e.key === 'Backspace') {
        handleBackspace()
      } else if (e.key === 'Enter') {
        handlePinSubmit(pinInput)
      } else if (e.key === 'Escape') {
        setPinInput('')
        setPinError('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasMounted, isBaristaAuthenticated, pinInput])

  const handlePinPress = (digit: string) => {
    if (pinInput.length >= 6) return
    const nextPin = pinInput + digit
    setPinInput(nextPin)
    setPinError('')

    // Tự động kiểm tra nếu đủ 4 số
    if (nextPin.length === 4) {
      handlePinSubmit(nextPin)
    }
  }

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1))
    setPinError('')
  }

  const handleClearPin = () => {
    setPinInput('')
    setPinError('')
  }

  const handlePinSubmit = (pinToCheck: string) => {
    const success = loginBarista(pinToCheck)
    if (success) {
      setPinInput('')
      setPinError('')
      playBaristaChime()
    } else {
      setIsShaking(true)
      setPinError('Mã PIN không đúng! Vui lòng thử lại.')
      setTimeout(() => setIsShaking(false), 500)
      setPinInput('')
    }
  }

  const handleFillDefaultPin = () => {
    setPinInput('8888')
    handlePinSubmit('8888')
  }

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    setModalSuccess('')

    if (newPin !== confirmNewPin) {
      setModalError('Mã PIN mới và xác nhận không khớp!')
      return
    }

    const res = changeBaristaPin(oldPin, newPin)
    if (res.success) {
      setModalSuccess(res.message)
      setTimeout(() => {
        setShowPinModal(false)
        setOldPin('')
        setNewPin('')
        setConfirmNewPin('')
        setModalSuccess('')
      }, 1500)
    } else {
      setModalError(res.message)
    }
  }

  // Tính thời gian trôi qua từ lúc tạo đơn
  const getElapsedTime = (createdAt: string) => {
    if (!currentTime) return 'Vừa xong'
    const diffMs = currentTime.getTime() - new Date(createdAt).getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours} giờ trước`
  }

  // Lọc danh sách đơn hàng theo 2 trạng thái chính của Barista (hoặc Tất cả)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Trạng thái 'Bắt đầu pha chế' (gồm đơn mới nhận, chờ pha hoặc đang pha)
      if (statusFilter === 'BREWING') {
        const isBrewing = order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PREPARING'
        if (!isBrewing) return false
      }
      // 2. Trạng thái 'Đã xong' (gồm đơn đã pha xong hoặc đã hoàn tất)
      else if (statusFilter === 'COMPLETED') {
        const isDone = order.status === 'READY' || order.status === 'COMPLETED'
        if (!isDone) return false
      }

      // Lọc theo tìm kiếm (mã đơn, bàn, tên khách, món)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesCode = order.order_code.toLowerCase().includes(query)
        const matchesCustomer = (order.customer_name || '').toLowerCase().includes(query)
        const matchesTable = (order.table?.name || '').toLowerCase().includes(query)
        const items = getOrderItems(order)
        const matchesItems = items.some((i: OrderItem) => i.product_name.toLowerCase().includes(query))
        return matchesCode || matchesCustomer || matchesTable || matchesItems
      }
      return true
    })
  }, [orders, statusFilter, searchQuery])

  // Đếm số lượng theo 2 trạng thái Barista
  const counts = useMemo(() => {
    const brewing = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PREPARING').length
    const completed = orders.filter((o) => o.status === 'READY' || o.status === 'COMPLETED').length
    return {
      all: orders.length,
      brewing,
      completed,
    }
  }, [orders])

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#1C140E] flex flex-col items-center justify-center text-amber-100">
        <div className="w-12 h-12 rounded-full border-4 border-amber-600/30 border-t-amber-500 animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">Đang khởi động trạm Barista KDS...</p>
      </div>
    )
  }

  // =========================================================================
  // MÀN HÌNH KHÓA (CHỈ BARISTA MỚI CÓ MÃ PIN ĐỂ TRUY CẬP)
  // =========================================================================
  if (!isBaristaAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1C140E] via-[#2A1D15] to-[#120B06] flex flex-col items-center justify-center p-4 select-none">
        {/* Nút quay lại trang thực đơn khách hàng */}
        <div className="absolute top-6 left-6">
          <Link
            href="/menu"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về thực đơn khách hàng</span>
          </Link>
        </div>

        <div className="w-full max-w-sm flex flex-col items-center">
          {/* Logo & Tiêu đề */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#B26A3B] to-[#D48D55] flex items-center justify-center text-white shadow-2xl shadow-amber-900/50 mb-4 ring-4 ring-amber-500/20">
            <ChefHat className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-black text-amber-50 tracking-tight text-center">
            BARISTA STATION KDS
          </h1>
          <p className="text-xs text-amber-300/70 text-center mt-1 flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Khu vực bảo mật dành riêng cho Barista pha chế
          </p>

          {/* Ô hiển thị số chấm PIN */}
          <div
            className={`mt-8 bg-stone-900/80 border ${pinError ? 'border-red-500/80 ring-2 ring-red-500/30' : 'border-amber-700/30'
              } backdrop-blur-xl rounded-3xl p-6 w-full shadow-2xl flex flex-col items-center transition-all ${isShaking ? 'animate-shake' : ''
              }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200/60 mb-4">
              Nhập mã PIN truy cập (4 số)
            </span>

            {/* Các chấm hiển thị số lượng số đã nhập */}
            <div className="flex items-center gap-4 mb-3">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = pinInput.length > idx
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${isFilled
                      ? 'bg-gradient-to-tr from-amber-400 to-amber-200 scale-125 shadow-lg shadow-amber-500/50'
                      : 'border-2 border-amber-700/40 bg-stone-800/60'
                      }`}
                  />
                )
              })}
            </div>

            {/* Thông báo lỗi */}
            {pinError ? (
              <p className="text-xs text-red-400 font-semibold flex items-center gap-1 mt-1 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {pinError}
              </p>
            ) : (
              <p className="text-[11px] text-amber-200/40 mt-1">
                Sử dụng bàn phím cảm ứng hoặc phím số trên máy tính
              </p>
            )}

            {/* Bàn phím số cảm ứng (Touch Numeric Keypad) */}
            <div className="grid grid-cols-3 gap-3 w-full mt-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePinPress(num.toString())}
                  className="h-14 rounded-2xl bg-stone-800/80 hover:bg-stone-700/90 active:bg-amber-600/40 border border-stone-700/50 text-xl font-bold text-amber-100 flex items-center justify-center shadow-md active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}

              {/* Phím Clear */}
              <button
                type="button"
                onClick={handleClearPin}
                className="h-14 rounded-2xl bg-stone-800/40 hover:bg-red-950/40 active:bg-red-900/60 border border-stone-700/40 text-xs font-bold text-red-300 flex items-center justify-center shadow-md active:scale-95 transition-all"
              >
                XÓA (C)
              </button>

              {/* Phím 0 */}
              <button
                type="button"
                onClick={() => handlePinPress('0')}
                className="h-14 rounded-2xl bg-stone-800/80 hover:bg-stone-700/90 active:bg-amber-600/40 border border-stone-700/50 text-xl font-bold text-amber-100 flex items-center justify-center shadow-md active:scale-95 transition-all"
              >
                0
              </button>

              {/* Phím Backspace */}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-stone-800/40 hover:bg-amber-950/40 active:bg-amber-900/60 border border-stone-700/40 text-sm font-bold text-amber-300 flex items-center justify-center shadow-md active:scale-95 transition-all"
                aria-label="Xóa 1 số"
              >
                ⌫
              </button>
            </div>

            {/* Gợi ý test nhanh */}
            <div className="mt-6 pt-4 border-t border-stone-800 w-full flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleFillDefaultPin}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 underline decoration-amber-500/40 hover:decoration-amber-400 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mã PIN mặc định là: <strong className="font-mono text-white">8888</strong> (Bấm để thử ngay)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-[11px] text-amber-200/30">
            Hệ thống hiển thị nhà bếp KDS • Tự động đồng bộ thời gian thực
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // BẢNG ĐIỀU KHIỂN BARISTA THỜI GIAN THỰC (KDS DASHBOARD)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#140D08] text-amber-100 flex flex-col font-sans">
      <Toaster position="top-right" />
      {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG (BARISTA TOPBAR) */}
      <header className="sticky top-0 z-30 bg-[#1C140E]/95 backdrop-blur-md border-b border-amber-900/30 px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Trạng thái hoạt động */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B26A3B] to-[#D48D55] flex items-center justify-center text-white shadow-md">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-amber-50 tracking-tight leading-none">
                    BARISTA KDS
                  </h1>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    REALTIME
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/60 font-medium mt-0.5">
                  Bảng hiển thị đơn hàng pha chế trực tiếp
                </p>
              </div>
            </div>

            {/* Đồng hồ số thời gian thực */}
            {currentTime && (
              <div className="sm:hidden font-mono text-xs font-bold text-amber-400 bg-stone-900/80 px-2.5 py-1 rounded-xl border border-stone-800">
                {currentTime.toLocaleTimeString('vi-VN')}
              </div>
            )}
          </div>

          {/* Công cụ: Đồng hồ, Chuông âm thanh, Đổi PIN, Reset mock, Khóa màn hình */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {currentTime && (
              <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs font-bold text-amber-300 bg-stone-900/80 px-3 py-1.5 rounded-2xl border border-amber-900/40 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{currentTime.toLocaleTimeString('vi-VN')}</span>
              </div>
            )}

            {/* Bật/Tắt chuông báo đơn mới */}
            <button
              type="button"
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all ${soundEnabled
                ? 'bg-amber-950/60 border-amber-600/40 text-amber-300 hover:bg-amber-900/60'
                : 'bg-stone-900/60 border-stone-800 text-stone-500 hover:text-stone-300'
                }`}
              title={soundEnabled ? 'Chuông âm thanh đang BẬT' : 'Chuông âm thanh đang TẮT'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Chuông: Bật</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">Chuông: Tắt</span>
                </>
              )}
            </button>

            {/* Đổi mã PIN */}
            <button
              type="button"
              onClick={() => setShowPinModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition-all"
              title="Đổi mã PIN Barista"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Đổi PIN</span>
            </button>

            {/* Khôi phục danh sách mẫu để test */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Khôi phục danh sách đơn hàng demo ban đầu?')) {
                  resetToMockOrders()
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold bg-stone-900/80 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition-all"
              title="Khôi phục đơn mẫu"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden lg:inline">Reset mẫu</span>
            </button>

            {/* Nút Khóa màn hình / Đăng xuất */}
            <button
              type="button"
              onClick={logoutBarista}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-red-950/60 hover:bg-red-900/80 border border-red-700/50 text-red-200 transition-all shadow-xs"
              title="Khóa màn hình Barista"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Khóa KDS</span>
            </button>
          </div>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH (MAIN DASHBOARD) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* THANH THỐNG KÊ NHANH (CHỈ CÓ 2 TRẠNG THÁI: BẮT ĐẦU PHA CHẾ & ĐÃ XONG) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tất cả đơn */}
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`p-4 rounded-2xl border text-left transition-all ${statusFilter === 'ALL'
              ? 'bg-amber-950/70 border-amber-500/60 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/40'
              : 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-800/60'
              }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              Tất cả đơn
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{counts.all}</span>
              <span className="text-[11px] text-stone-500 font-medium">tổng hôm nay</span>
            </div>
          </button>

          {/* 1. Bắt đầu pha chế */}
          <button
            type="button"
            onClick={() => setStatusFilter('BREWING')}
            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${statusFilter === 'BREWING'
              ? 'bg-amber-900/60 border-amber-500/80 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500/40'
              : 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-800/60'
              }`}
          >
            {counts.brewing > 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block flex items-center gap-1.5">
              <Coffee className="w-3.5 h-3.5" />
              1. Bắt đầu pha chế
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">{counts.brewing}</span>
              <span className="text-[11px] text-amber-300/60 font-medium">chờ & đang pha</span>
            </div>
          </button>

          {/* 2. Đã xong */}
          <button
            type="button"
            onClick={() => setStatusFilter('COMPLETED')}
            className={`p-4 rounded-2xl border text-left transition-all ${statusFilter === 'COMPLETED'
              ? 'bg-emerald-950/70 border-emerald-500/80 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/40'
              : 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-800/60'
              }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              2. Đã xong
            </span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">{counts.completed}</span>
              <span className="text-[11px] text-emerald-300/60 font-medium">hoàn thành</span>
            </div>
          </button>
        </div>

        {/* BỘ LỌC VÀ TÌM KIẾM */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-2xl border border-stone-800">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã đơn (CF...), số bàn, tên khách hoặc món nước..."
              className="w-full pl-10 pr-4 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-xs font-medium text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-stone-400 px-2 shrink-0">
            Hiển thị <strong className="text-amber-400">{filteredOrders.length}</strong> đơn hàng
          </div>
        </div>

        {/* DANH SÁCH THẺ ĐƠN HÀNG (BARISTA ORDER CARDS) */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-stone-900/40 rounded-3xl border border-dashed border-stone-800 p-8">
            <Coffee className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-300">Không có đơn hàng nào phù hợp</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Không tìm thấy đơn nào theo từ khóa hiện tại. Thử xóa tìm kiếm.'
                : 'Chưa có đơn hàng nào trong mục này. Khi khách đặt món từ thực đơn hoặc checkout, đơn sẽ xuất hiện ngay tại đây!'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-amber-300"
              >
                Xóa từ khóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const isDone = order.status === 'COMPLETED' || order.status === 'READY'
              const isPreparing = order.status === 'PREPARING'
              const isPending = !isDone && !isPreparing

              return (
                <div
                  key={order.id}
                  className={`flex flex-col rounded-3xl border transition-all relative overflow-hidden bg-gradient-to-b from-stone-900/90 to-[#19120B] shadow-xl ${isDone
                    ? 'border-emerald-900/60 shadow-emerald-950/20 opacity-85'
                    : isPreparing
                      ? 'border-orange-500/70 shadow-orange-950/40 ring-1 ring-orange-500/30'
                      : 'border-amber-500/70 shadow-amber-950/40 ring-1 ring-amber-500/30'
                    }`}
                >
                  {/* Dải trạng thái đầu card: Chỉ 2 trạng thái Bắt đầu pha chế hoặc Đã xong */}
                  <div
                    className={`px-4 py-2.5 flex items-center justify-between text-xs font-bold border-b ${isDone
                      ? 'bg-emerald-950/70 border-emerald-800/40 text-emerald-300'
                      : isPreparing
                        ? 'bg-orange-950/70 border-orange-800/40 text-orange-300'
                        : 'bg-amber-950/70 border-amber-800/40 text-amber-300'
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${isDone
                          ? 'bg-emerald-400'
                          : isPreparing
                            ? 'bg-orange-400 animate-pulse'
                            : 'bg-amber-400 animate-ping'
                          }`}
                      />
                      <span className="uppercase tracking-wider text-[11px]">
                        {isDone ? 'Đã xong ✅' : isPreparing ? 'Đang pha chế ☕' : 'Bắt đầu pha chế'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-stone-300/80 font-medium">
                      <Timer className="w-3.5 h-3.5" />
                      <span>{getElapsedTime(order.created_at)}</span>
                    </div>
                  </div>

                  {/* Thân thẻ đơn hàng */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-4">
                    {/* Mã đơn & Số bàn */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-800/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-black text-white tracking-tight">
                            #{order.order_code}
                          </h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700">
                            {getPaymentLabel(order.payment_method)}
                          </span>
                        </div>
                        {order.customer_name && (
                          <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                            <User className="w-3.5 h-3.5 text-amber-500" />
                            <span>{order.customer_name}</span>
                            {order.customer_phone && (
                              <span className="text-stone-500">({order.customer_phone})</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Vị trí bàn */}
                      <div className="shrink-0 text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{order.table?.name || 'Tại quầy'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ghi chú chung của đơn nếu có */}
                    {order.note && (
                      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40 text-amber-200 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-amber-300 block">Ghi chú của khách:</strong>
                          <span>{order.note}</span>
                        </div>
                      </div>
                    )}

                    {/* Danh sách các món pha chế */}
                    {(() => {
                      const orderItems = getOrderItems(order)
                      return (
                        <div className="space-y-2.5 flex-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex justify-between">
                            <span>Danh sách món ({orderItems.reduce((s: number, i: OrderItem) => s + i.quantity, 0)})</span>
                            <span>Công thức</span>
                          </div>

                          <div className="space-y-2">
                            {orderItems.map((item: OrderItem) => (
                              <div
                                key={item.id}
                                className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800/80 flex items-start justify-between gap-3"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-amber-600/30 border border-amber-500/40 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                                      {item.quantity}×
                                    </span>
                                    <span className="font-bold text-sm text-amber-50">
                                      {item.product_name}
                                    </span>
                                  </div>

                                  {/* Chi tiết tùy chọn (Đường, Đá, Size, Topping) */}
                                  {item.options_text && (
                                    <p className="text-xs text-amber-200/80 pl-8 font-medium">
                                      {item.options_text}
                                    </p>
                                  )}

                                  {item.note && (
                                    <p className="text-[11px] text-orange-300/90 italic pl-8">
                                      ⚡ Ghi chú: {item.note}
                                    </p>
                                  )}
                                </div>

                                <span className="text-xs font-bold text-stone-400 shrink-0">
                                  {formatCurrency(item.subtotal)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Tổng tiền */}
                    <div className="pt-2 border-t border-stone-800/60 flex justify-between items-center text-xs">
                      <span className="text-stone-400">Tổng thanh toán:</span>
                      <span className="text-sm font-black text-amber-400">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    {/* NÚT THAO TÁC BARISTA (CHỈ 2 TRẠNG THÁI: BẮT ĐẦU PHA CHẾ & ĐÃ XONG) */}
                    <div className="pt-2 space-y-2">
                      {isPending && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(order.id, 'PREPARING')
                              toast.success(`Bắt đầu pha chế đơn #${order.order_code}! ☕`)
                            }}
                            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-98 text-white text-xs font-black shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 transition-all"
                          >
                            <Coffee className="w-4 h-4" />
                            <span>BẮT ĐẦU PHA CHẾ</span>
                          </button>
                        </div>
                      )}

                      {isPreparing && (
                        <button
                          type="button"
                          onClick={() => {
                            updateOrderStatus(order.id, 'COMPLETED')
                            if (soundEnabled) playBaristaChime()
                            toast.success(`Đã xong đơn #${order.order_code}! ✅`)
                          }}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white text-sm font-black shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          <span>ĐÃ XONG ✅</span>
                        </button>
                      )}

                      {isDone && (
                        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-950/30 border border-emerald-900/40 text-xs">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <Check className="w-4 h-4" /> Đã xong
                          </span>

                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* MODAL ĐỔI MÃ PIN BARISTA */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1C140E] border border-amber-900/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setShowPinModal(false)
                setModalError('')
                setModalSuccess('')
              }}
              className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Đổi mã PIN Barista</h3>
                <p className="text-xs text-stone-400">Bảo mật trạm pha chế quầy Bar</p>
              </div>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Mã PIN hiện tại
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="Nhập mã PIN cũ (VD: 8888)"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Mã PIN mới (4 - 6 số)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Nhập mã PIN mới"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1">
                  Xác nhận mã PIN mới
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value)}
                  placeholder="Nhập lại mã PIN mới"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {modalError && (
                <p className="text-xs text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {modalError}
                </p>
              )}

              {modalSuccess && (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  {modalSuccess}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#B26A3B] hover:bg-[#C27A4B] text-xs font-bold text-white shadow-md"
                >
                  Cập nhật PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
