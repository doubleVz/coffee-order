'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/customer/Header'
import { Footer } from '@/components/customer/Footer'
import { useTableStore } from '@/lib/store/table-store'
import { useCartStore } from '@/lib/store/cart-store'
import {
  Users,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  Coffee,
  Search,
  Filter,
  ArrowRight,
  Armchair,
  UtensilsCrossed,
  ShieldCheck,
  Building,
  TreePine,
  Sun,
  LayoutGrid,
  Plus,
  Minus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Table, TableStatus } from '@/types'

function getTimeElapsed(occupiedAt: string | null | undefined): string {
  if (!occupiedAt) return 'Vừa vào'
  const diffMs = Date.now() - new Date(occupiedAt).getTime()
  if (diffMs < 0) return 'Vừa vào'
  const diffMins = Math.floor(diffMs / (1000 * 60))
  if (diffMins < 60) return `${diffMins} phút trước`
  const hours = Math.floor(diffMins / 60)
  const remainingMins = diffMins % 60
  return `${hours}h ${remainingMins}m trước`
}

export default function CheckBanPage() {
  const tables = useTableStore((s) => s.tables)
  const addCustomerToTable = useTableStore((s) => s.addCustomerToTable)
  const removeCustomerFromTable = useTableStore((s) => s.removeCustomerFromTable)
  const resetTable = useTableStore((s) => s.resetTable)
  const occupyTable = useTableStore((s) => s.occupyTable)
  const resetAllToDefault = useTableStore((s) => s.resetAllToDefault)
  const setTableInCart = useCartStore((s) => s.setTable)

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'PARTIAL' | 'OCCUPIED'>('ALL')
  const [areaFilter, setAreaFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Tick for elapsed time calculation
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(timer)
  }, [])

  // Calculate detailed statistics
  const totalTables = tables.length
  const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0)
  const totalOccupiedSeats = tables.reduce((sum, t) => sum + (typeof t.occupied_seats === 'number' ? t.occupied_seats : 0), 0)
  const totalAvailableSeats = Math.max(0, totalCapacity - totalOccupiedSeats)
  const overallOccupancyRate = totalCapacity > 0 ? Math.round((totalOccupiedSeats / totalCapacity) * 100) : 0

  // Count tables by state
  const tablesWithRoom = tables.filter((t) => (t.occupied_seats || 0) < t.capacity).length
  const tablesFull = tables.filter((t) => (t.occupied_seats || 0) >= t.capacity).length

  // Areas list
  const areas = Array.from(new Set(tables.map((t) => t.area || 'Trong nhà')))

  // Filtered tables
  const filteredTables = tables.filter((table) => {
    const occ = typeof table.occupied_seats === 'number' ? table.occupied_seats : 0
    const isFull = occ >= table.capacity
    const isAvailable = occ === 0
    const isPartial = occ > 0 && occ < table.capacity

    let matchesStatus = true
    if (statusFilter === 'AVAILABLE') matchesStatus = isAvailable
    else if (statusFilter === 'PARTIAL') matchesStatus = isPartial
    else if (statusFilter === 'OCCUPIED') matchesStatus = isFull

    const matchesArea = areaFilter === 'ALL' || (table.area || 'Trong nhà') === areaFilter

    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      table.name.toLowerCase().includes(q) ||
      table.code.toLowerCase().includes(q) ||
      (table.area && table.area.toLowerCase().includes(q)) ||
      (table.customers && table.customers.some((c) => c.toLowerCase().includes(q)))

    return matchesStatus && matchesArea && matchesSearch
  })

  // Action: Add 1 customer to table
  const handleIncrementSeat = (table: Table) => {
    const occ = typeof table.occupied_seats === 'number' ? table.occupied_seats : 0
    if (occ >= table.capacity) {
      toast.error(`${table.name} đã kín toàn bộ ${table.capacity} chỗ!`)
      return
    }
    addCustomerToTable(table.id, 'Khách vào bàn', 1)
    toast.success(`Đã tăng +1 chỗ tại ${table.name} (hiện có ${occ + 1}/${table.capacity} chỗ)`, {
      icon: '🪑',
      duration: 2500,
    })
  }

  // Action: Remove 1 customer from table
  const handleDecrementSeat = (table: Table) => {
    const occ = typeof table.occupied_seats === 'number' ? table.occupied_seats : 0
    if (occ <= 0) {
      toast.error(`${table.name} hiện đang trống hoàn toàn!`)
      return
    }
    removeCustomerFromTable(table.id, 1)
    toast.success(`Đã giảm -1 chỗ tại ${table.name} (còn ${Math.max(0, occ - 1)}/${table.capacity} chỗ)`, {
      icon: '↩️',
      duration: 2500,
    })
  }

  // Action: Reset table when customer leaves
  const handleResetTable = (table: Table) => {
    resetTable(table.id)
    toast.success(`Đã reset ${table.name} về 0 chỗ (BÀN TRỐNG HOÀN TOÀN)!`, {
      icon: '🟢',
      duration: 3000,
    })
  }

  // Action: Select table to order
  const handleSelectTableToOrder = (table: Table) => {
    setTableInCart(table.id, table.name)
    toast.success(`Đã chọn ${table.name} cho đơn hàng!`, { icon: '☕' })
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231709] flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider mb-2">
              <Armchair className="w-3.5 h-3.5 text-amber-700" />
              Sơ đồ chỗ ngồi Coffee House
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#231709] tracking-tight">
              Check bàn & Tình trạng lấp đầy chỗ ngồi
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Theo dõi chi tiết <strong>tổng số chỗ</strong>, <strong>số chỗ đã lấp đầy</strong> và <strong>chỗ còn trống</strong> theo thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (confirm('Khôi phục trạng thái danh sách bàn mẫu ban đầu?')) {
                  resetAllToDefault()
                  toast.success('Đã tải lại danh sách bàn mẫu!')
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Khôi phục mẫu
            </button>

            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#654321] to-[#B26A3B] text-white text-xs font-bold hover:opacity-95 shadow-md shadow-amber-950/15 transition-all"
            >
              <Coffee className="h-3.5 w-3.5" />
              Xem thực đơn & Gọi món
            </Link>
          </div>
        </div>

        {/* Real-time Statistics Cards (Chỗ ngồi & Bàn) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Tổng số chỗ ngồi */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                Tổng số chỗ ngồi
              </span>
              <span className="text-3xl font-black text-[#231709] mt-1 block">
                {totalCapacity} <span className="text-sm font-bold text-stone-500">ghế</span>
              </span>
              <span className="text-[11px] text-stone-400 mt-0.5 block">Phân bổ trên {totalTables} bàn</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
              <Armchair className="w-6 h-6" />
            </div>
          </div>

          {/* Card: Số chỗ đã lấp đầy */}
          <div className="bg-amber-50/80 p-5 rounded-3xl border-2 border-amber-300 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Đã lấp đầy
              </span>
              <span className="text-3xl font-black text-amber-900 mt-1 block">
                {totalOccupiedSeats} <span className="text-sm font-bold text-amber-700">/{totalCapacity}</span>
              </span>
              <span className="text-[11px] text-amber-700 font-bold mt-0.5 block">
                Tỷ lệ lấp đầy: {overallOccupancyRate}%
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-700/20">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card: Số chỗ còn trống */}
          <div className="bg-emerald-50/80 p-5 rounded-3xl border-2 border-emerald-400/60 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Chỗ còn trống
              </span>
              <span className="text-3xl font-black text-emerald-700 mt-1 block">
                {totalAvailableSeats} <span className="text-sm font-bold text-emerald-600">chỗ</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                Sẵn sàng đón khách mới
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          {/* Card: Số bàn còn nhận khách */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                Bàn còn chỗ
              </span>
              <span className="text-3xl font-black text-[#231709] mt-1 block">
                {tablesWithRoom} <span className="text-sm font-bold text-stone-500">/{totalTables} bàn</span>
              </span>
              <span className="text-[11px] text-stone-400 mt-0.5 block">
                {tablesFull} bàn đã kín chỗ
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Coffee className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên bàn, mã bàn, khu vực hoặc tên khách..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#B26A3B] transition-colors"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl overflow-x-auto text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-[#231709] shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Tất cả ({tables.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('AVAILABLE')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-500 hover:text-emerald-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Trống hoàn toàn ({tables.filter((t) => (t.occupied_seats || 0) === 0).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PARTIAL')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'PARTIAL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-500 hover:text-amber-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Đang có khách ({tables.filter((t) => (t.occupied_seats || 0) > 0 && (t.occupied_seats || 0) < t.capacity).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('OCCUPIED')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                  statusFilter === 'OCCUPIED'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-stone-500 hover:text-red-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Đã kín ({tablesFull})
              </button>
            </div>
          </div>

          {/* Area Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-stone-100 text-xs font-semibold">
            <span className="text-stone-400 font-bold shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Khu vực:
            </span>
            <button
              type="button"
              onClick={() => setAreaFilter('ALL')}
              className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                areaFilter === 'ALL'
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Tất cả khu vực
            </button>
            {areas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setAreaFilter(area)}
                className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                  areaFilter === area
                    ? 'bg-amber-800 text-white font-bold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {area} ({tables.filter((t) => (t.area || 'Trong nhà') === area).length})
              </button>
            ))}
          </div>
        </div>

        {/* Visual Table Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTables.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-stone-200">
              <Armchair className="h-12 w-12 text-stone-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-stone-600">Không tìm thấy bàn nào phù hợp</p>
              <p className="text-xs text-stone-400 mt-1">Vui lòng thử đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            filteredTables.map((table) => {
              const occ = typeof table.occupied_seats === 'number' ? table.occupied_seats : 0
              const remaining = Math.max(0, table.capacity - occ)
              const isFull = occ >= table.capacity
              const isPartial = occ > 0 && !isFull
              const isEmpty = occ === 0
              const occupancyPct = Math.min(100, Math.round((occ / table.capacity) * 100))

              return (
                <div
                  key={table.id}
                  className={`rounded-3xl border-2 p-5 transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                    isFull
                      ? 'bg-white border-red-300 hover:border-red-500 hover:shadow-md ring-1 ring-red-100'
                      : isPartial
                      ? 'bg-white border-amber-300 hover:border-amber-500 hover:shadow-md ring-1 ring-amber-100'
                      : 'bg-white border-emerald-300 hover:border-emerald-500 hover:shadow-md ring-1 ring-emerald-100'
                  }`}
                >
                  {/* Card Header: Table Code & Name */}
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                      <div>
                        <span className="font-mono text-xs font-black text-stone-400">
                          #{table.code}
                        </span>
                        <h3 className="font-bold text-base text-[#231709] mt-0.5">
                          {table.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 mt-1">
                          <MapPin className="w-3 h-3 text-amber-700" />
                          {table.area || 'Khu vực chung'}
                        </span>
                      </div>

                      {/* Status indicator tag */}
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg shrink-0 ${
                          isFull
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : isPartial
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isFull ? 'Đã kín chỗ' : isPartial ? 'Có khách' : 'Bàn trống'}
                      </span>
                    </div>

                    {/* Prominent 3-Metric Numbers Box: Tổng chỗ | Đã lấp | Còn trống */}
                    <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                          Tổng số chỗ
                        </span>
                        <span className="text-lg font-black text-[#231709] mt-0.5 block">
                          {table.capacity}
                        </span>
                      </div>
                      <div className="border-x border-stone-200">
                        <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                          Đã lấp đầy
                        </span>
                        <span
                          className={`text-lg font-black mt-0.5 block ${
                            isFull ? 'text-red-600' : isPartial ? 'text-amber-700' : 'text-stone-400'
                          }`}
                        >
                          {occ}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                          Còn trống
                        </span>
                        <span
                          className={`text-lg font-black mt-0.5 block ${
                            remaining > 0 ? 'text-emerald-700' : 'text-stone-300'
                          }`}
                        >
                          {remaining}
                        </span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-stone-500">Tiến trình lấp đầy:</span>
                        <span className={isFull ? 'text-red-700' : isPartial ? 'text-amber-700' : 'text-emerald-700'}>
                          {occ}/{table.capacity} chỗ ({occupancyPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull
                              ? 'bg-gradient-to-r from-red-500 to-rose-600'
                              : isPartial
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Seat Icon Visualizer: mỗi ô thể hiện 1 chiếc ghế */}
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                        Sơ đồ từng ghế ({occ} ngồi / {table.capacity} tổng):
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Array.from({ length: table.capacity }).map((_, idx) => {
                          const isSeatOccupied = idx < occ
                          return (
                            <div
                              key={idx}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                                isSeatOccupied
                                  ? isFull
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-stone-100 text-stone-400 border border-dashed border-stone-300'
                              }`}
                              title={`Ghế ${idx + 1}: ${isSeatOccupied ? 'Đã có khách ngồi' : 'Ghế còn trống'}`}
                            >
                              <Armchair className="w-3.5 h-3.5" />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Customer Info Box */}
                    <div className="mt-3">
                      {occ > 0 ? (
                        <div
                          className={`p-3 rounded-2xl border space-y-1.5 text-xs ${
                            isFull
                              ? 'bg-red-50/80 border-red-200 text-red-950'
                              : 'bg-amber-50/80 border-amber-200 text-amber-950'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-stone-500" />
                              {getTimeElapsed(table.occupied_at)}
                            </span>
                            <span className="text-[11px] font-semibold text-stone-600">
                              {occ} khách đang ngồi
                            </span>
                          </div>
                          {table.customers && table.customers.length > 0 && (
                            <div className="pt-1 border-t border-black/5 text-[11px]">
                              <span className="font-bold text-stone-700">Khách order: </span>
                              <span className="text-stone-600">{table.customers.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                              BÀN TRỐNG TOÀN BỘ
                            </span>
                            <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {table.capacity} chỗ
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700/80">
                            Sạch sẽ, sẵn sàng đón khách vào ngồi
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="pt-3 border-t border-stone-100 space-y-2">
                    {/* Stepper Buttons: Tăng / Giảm số chỗ lấp đầy */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isFull) {
                            toast.error(`${table.name} đã kín toàn bộ ${table.capacity} chỗ! Không thể thêm khách.`, { icon: '⛔' })
                            return
                          }
                          handleIncrementSeat(table)
                        }}
                        aria-disabled={isFull}
                        className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                          isFull
                            ? 'bg-stone-100 text-stone-400 opacity-60 cursor-not-allowed select-none'
                            : 'bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer'
                        }`}
                        title={isFull ? `${table.name} đã kín toàn bộ chỗ` : 'Tăng 1 khách lấp đầy vào bàn'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isFull ? 'Đã kín chỗ' : `+1 Khách (${occ}/${table.capacity})`}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDecrementSeat(table)}
                        disabled={isEmpty}
                        className="py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
                        title="Giảm 1 khách khi có người rời bàn"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>-1 Khách rời</span>
                      </button>
                    </div>

                    {/* Reset All or Order */}
                    {occ > 0 ? (
                      /* Reset whole table button */
                      <button
                        type="button"
                        onClick={() => handleResetTable(table)}
                        className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-700/20 active:scale-98 transition-all cursor-pointer"
                        title="Bấm để dọn sạch bàn và đưa về 0 chỗ"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Khách rời đi (Reset toàn bộ)</span>
                      </button>
                    ) : (
                      /* Order for empty table */
                      <Link
                        href={`/menu?table=${table.id}`}
                        onClick={() => handleSelectTableToOrder(table)}
                        className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer text-center"
                        title="Chọn bàn này và chuyển sang gọi món"
                      >
                        <span>Chọn bàn này & Gọi món</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
