'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order, OrderStatus } from '@/types'
import { MOCK_ORDERS } from '@/lib/data/mock-data'

// Kênh BroadcastChannel đồng bộ thời gian thực xuyên suốt các tab và cửa sổ trình duyệt
const BROADCAST_CHANNEL_NAME = 'coffee_orders_realtime_channel'
const LAST_UPDATE_KEY = 'coffee-orders-last-update'
const STORAGE_KEY = 'coffee-orders-store'

let globalBroadcastChannel: BroadcastChannel | null = null

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  if (!('BroadcastChannel' in window)) return null
  if (!globalBroadcastChannel) {
    try {
      globalBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
    } catch {
      globalBroadcastChannel = null
    }
  }
  return globalBroadcastChannel
}

function broadcastEvent(type: string, payload: unknown) {
  if (typeof window === 'undefined') return
  try {
    const channel = getBroadcastChannel()
    if (channel) {
      channel.postMessage({ type, payload, timestamp: Date.now() })
    }
  } catch {
    // ignore
  }

  // Cập nhật timestamp để kích hoạt 'storage' event cho các tab khác
  try {
    localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString())
  } catch {
    // ignore
  }
}

// Helper phát âm thanh báo đơn mới bằng Web Audio API (chuông 2 âm điệu nhẹ nhàng)
export function playBaristaChime() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const now = ctx.currentTime
    // Nốt 1: E5 (659Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(659.25, now)
    gain1.gain.setValueAtTime(0.3, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Nốt 2: A5 (880Hz)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.15)
    gain2.gain.setValueAtTime(0.35, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.55)
  } catch {
    // Trình duyệt có thể chặn autoplay nếu chưa có tương tác
  }
}

interface OrderStoreState {
  orders: Order[]
  isBaristaAuthenticated: boolean
  baristaPin: string
  soundEnabled: boolean

  // Quản lý đơn hàng
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  removeOrder: (orderId: string) => void
  resetToMockOrders: () => void
  syncOrdersFromStorage: () => void

  // Xác thực Barista (Mã PIN bảo mật)
  loginBarista: (pin: string) => boolean
  logoutBarista: () => void
  changeBaristaPin: (oldPin: string, newPin: string) => { success: boolean; message: string }
  toggleSound: () => void
}

export const useOrderStore = create<OrderStoreState>()(
  persist(
    (set, get) => ({
      orders: MOCK_ORDERS,
      isBaristaAuthenticated: false,
      baristaPin: '8888', // Mã PIN Barista mặc định
      soundEnabled: true,

      addOrder: (newOrder: Order) => {
        set((state) => {
          // Tránh thêm trùng đơn theo id
          const exists = state.orders.some((o) => o.id === newOrder.id)
          const updated = exists ? state.orders : [newOrder, ...state.orders]
          return { orders: updated }
        })

        // Gửi thông báo ngay lập tức sang tab Barista ở phòng pha chế qua BroadcastChannel
        broadcastEvent('NEW_ORDER', newOrder)

        // Chuông thông báo đơn hàng mới tại máy hiện tại
        if (get().soundEnabled) {
          playBaristaChime()
        }
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        const nowIso = new Date().toISOString()
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  updated_at: nowIso,
                }
              : o
          ),
        }))

        // Broadcast cập nhật trạng thái đơn
        broadcastEvent('UPDATE_ORDER_STATUS', { orderId, status, updated_at: nowIso })
      },

      removeOrder: (orderId: string) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        }))
        broadcastEvent('ORDERS_SYNC', get().orders)
      },

      resetToMockOrders: () => {
        set({ orders: MOCK_ORDERS })
        broadcastEvent('ORDERS_SYNC', MOCK_ORDERS)
      },

      syncOrdersFromStorage: () => {
        if (typeof window === 'undefined') return
        try {
          const raw = localStorage.getItem(STORAGE_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed?.state?.orders && Array.isArray(parsed.state.orders)) {
              const storedOrders: Order[] = parsed.state.orders
              const currentOrders = get().orders

              const isDiff =
                storedOrders.length !== currentOrders.length ||
                storedOrders.some((so, idx) => {
                  const co = currentOrders[idx]
                  return !co || co.id !== so.id || co.status !== so.status || co.updated_at !== so.updated_at
                })

              if (isDiff) {
                const hasNew = storedOrders.some((so) => !currentOrders.some((co) => co.id === so.id))
                set({ orders: storedOrders })
                if (hasNew) {
                  if (get().soundEnabled) playBaristaChime()
                  window.dispatchEvent(new CustomEvent('coffee:new-order', { detail: storedOrders[0] }))
                }
              }
            }
          }
        } catch {
          // ignore
        }
      },

      loginBarista: (pin: string) => {
        const currentPin = get().baristaPin || '8888'
        if (pin.trim() === currentPin.trim()) {
          set({ isBaristaAuthenticated: true })
          return true
        }
        return false
      },

      logoutBarista: () => {
        set({ isBaristaAuthenticated: false })
      },

      changeBaristaPin: (oldPin: string, newPin: string) => {
        const currentPin = get().baristaPin || '8888'
        if (oldPin.trim() !== currentPin.trim()) {
          return { success: false, message: 'Mã PIN hiện tại không chính xác!' }
        }
        if (!/^\d{4,6}$/.test(newPin.trim())) {
          return { success: false, message: 'Mã PIN mới phải từ 4 đến 6 chữ số!' }
        }
        set({ baristaPin: newPin.trim() })
        return { success: true, message: 'Đổi mã PIN Barista thành công!' }
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }))
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({
        orders: state.orders,
        baristaPin: state.baristaPin,
        soundEnabled: state.soundEnabled,
        // Không lưu isBaristaAuthenticated để khóa lại khi đóng trình duyệt (an toàn)
      }),
    }
  )
)

// =========================================================================
// TỰ ĐỘNG KHỞI TẠO LẮNG NGHE ĐỒNG BỘ THỜI GIAN THỰC XUYÊN TAB (CLIENT-SIDE)
// =========================================================================
if (typeof window !== 'undefined') {
  // 1. Lắng nghe BroadcastChannel (Không có độ trễ, tức thì giữa các tab)
  const channel = getBroadcastChannel()
  if (channel) {
    channel.onmessage = (event) => {
      const data = event.data
      if (!data) return

      if (data.type === 'NEW_ORDER' && data.payload) {
        const newOrder = data.payload as Order
        useOrderStore.setState((state) => {
          if (state.orders.some((o) => o.id === newOrder.id)) return state
          return { orders: [newOrder, ...state.orders] }
        })

        // Kêu chuông tại tab Barista khi có đơn mới được gửi từ thu ngân
        if (useOrderStore.getState().soundEnabled) {
          playBaristaChime()
        }

        // Bắn CustomEvent để các component UI (Barista KDS) hiển thị thông báo popup trực tiếp
        window.dispatchEvent(new CustomEvent('coffee:new-order', { detail: newOrder }))
      } else if (data.type === 'UPDATE_ORDER_STATUS' && data.payload) {
        const { orderId, status, updated_at } = data.payload as { orderId: string; status: OrderStatus; updated_at?: string }
        useOrderStore.setState((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status, updated_at: updated_at || new Date().toISOString() } : o
          ),
        }))
        window.dispatchEvent(new CustomEvent('coffee:order-updated', { detail: data.payload }))
      } else if (data.type === 'ORDERS_SYNC' && Array.isArray(data.payload)) {
        useOrderStore.setState({ orders: data.payload as Order[] })
      }
    }
  }

  // 2. Lắng nghe sự kiện 'storage' của Window (khi tab khác cập nhật localStorage)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === LAST_UPDATE_KEY) {
      useOrderStore.getState().syncOrdersFromStorage()
    }
  })
}
