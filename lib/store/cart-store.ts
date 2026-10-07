'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  tableId: string | null
  tableName: string | null
  addItem: (item: Omit<CartItem, 'id' | 'subtotal'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setTable: (id: string, name: string) => void
  clearTable: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      tableName: null,

      addItem: (item) => {
        const id = `${item.productId}-${item.size}-${item.sugar}-${item.ice}-${(item.toppings || []).map(t => t.name).sort().join(',')}-${Date.now()}`
        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              id,
              subtotal: item.unitPrice * item.quantity,
            },
          ],
        }))
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity, subtotal: item.unitPrice * quantity }
              : item
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      setTable: (id, name) => set({ tableId: id, tableName: name }),

      clearTable: () => set({ tableId: null, tableName: null }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.subtotal, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'coffee-order-cart',
    }
  )
)
