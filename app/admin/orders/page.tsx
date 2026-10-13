'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatTime, getStatusLabel, getStatusColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Search, RefreshCw, Coffee,
  CheckCircle, ChefHat, HandPlatter, CircleCheck, XCircle,
  ClipboardList
} from 'lucide-react'
import type { Order, OrderStatus } from '@/types'
import { useOrderStore } from '@/lib/store/order-store'
import toast from 'react-hot-toast'

const STATUS_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PREPARING', label: 'Đang làm' },
  { value: 'READY', label: 'Sẵn sàng' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

export default function AdminOrdersPage() {
  const storeOrders = useOrderStore((s) => s.orders)
  const updateStatusInStore = useOrderStore((s) => s.updateOrderStatus)
  const syncFromStorage = useOrderStore((s) => s.syncOrdersFromStorage)

  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const fetchOrders = useCallback(() => {
    syncFromStorage()
    toast.success('Đã làm mới danh sách đơn hàng')
  }, [syncFromStorage])

  useEffect(() => {
    syncFromStorage()
  }, [syncFromStorage])

  // Lọc danh sách đơn hàng từ store dùng chung
  const orders = storeOrders.filter((order) => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesCode = order.order_code.toLowerCase().includes(q)
      const matchesCustomer = (order.customer_name || '').toLowerCase().includes(q)
      const matchesPhone = (order.customer_phone || '').toLowerCase().includes(q)
      return matchesCode || matchesCustomer || matchesPhone
    }
    return true
  })

  // Realtime subscription (Supabase fallback)
  useEffect(() => {
    try {
      const supabase = createClient()
      const channel = supabase
        .channel('admin-orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            fetchOrders()
            try {
              if (audioRef.current) {
                audioRef.current.play().catch(() => {})
              }
            } catch {}
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch {
      // ignore
    }
  }, [fetchOrders])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    updateStatusInStore(orderId, newStatus as OrderStatus)
    toast.success(`Đã chuyển trạng thái: ${getStatusLabel(newStatus)}`)
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch {
      // ignore
    }
  }

  const getStatusActions = (status: string) => {
    switch (status) {
      case 'PENDING':
        return [
          { label: 'Xác nhận', status: 'CONFIRMED', icon: CheckCircle, variant: 'default' as const },
          { label: 'Hủy', status: 'CANCELLED', icon: XCircle, variant: 'destructive' as const },
        ]
      case 'CONFIRMED':
        return [
          { label: 'Bắt đầu làm', status: 'PREPARING', icon: ChefHat, variant: 'default' as const },
          { label: 'Hủy', status: 'CANCELLED', icon: XCircle, variant: 'destructive' as const },
        ]
      case 'PREPARING':
        return [
          { label: 'Sẵn sàng', status: 'READY', icon: HandPlatter, variant: 'default' as const },
        ]
      case 'READY':
        return [
          { label: 'Hoàn thành', status: 'COMPLETED', icon: CircleCheck, variant: 'default' as const },
        ]
      default:
        return []
    }
  }

  return (
    <div>
      {/* Notification Sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgmL+8n2lFPFqRs7OdZkM+WJG1tZ1mQj5Xj7S1nWZCPliRtbWdZkI+V4+0tZ1m" type="audio/wav" />
      </audio>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#3B2416]">Đơn hàng</h1>
        <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? 'bg-[#6F4E37] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm mã đơn, tên, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-16">
          <Coffee className="h-10 w-10 text-[#C68B59] mx-auto animate-pulse" />
          <p className="mt-4 text-sm text-gray-500">Đang tải...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="mt-4 text-gray-500">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#3B2416]">#{order.order_code}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    {order.table && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {order.table.name}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>{order.customer_name} • {order.customer_phone}</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    {(order.items || order.order_items)?.map((item) => (
                      <p key={item.id} className="text-sm text-gray-500">
                        {item.product_name} x{item.quantity}
                        {item.options_text && <span className="text-xs text-gray-400"> ({item.options_text})</span>}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-base font-bold text-[#C68B59]">{formatCurrency(order.total)}</span>
                    <span className="text-xs text-gray-400">{formatTime(order.created_at)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap sm:flex-col gap-2 sm:justify-center">
                  {getStatusActions(order.status).map((action) => (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, action.status)}
                      className="gap-1 text-xs"
                    >
                      <action.icon className="h-3.5 w-3.5" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
