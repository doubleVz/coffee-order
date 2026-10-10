'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Table, TableStatus } from '@/types'
import { MOCK_TABLES } from '@/lib/data/mock-data'

function calculateTableStatus(occupiedSeats: number, capacity: number): TableStatus {
  if (occupiedSeats <= 0) return 'AVAILABLE'
  if (occupiedSeats >= capacity) return 'OCCUPIED'
  return 'PARTIAL'
}

interface TableState {
  tables: Table[]
  // Thêm khách / order vào bàn (tăng số chỗ lấp đầy)
  addCustomerToTable: (tableId: string, customerName?: string, seatCount?: number) => void
  // Giảm khách rời đi (giảm số chỗ lấp đầy)
  removeCustomerFromTable: (tableId: string, seatCount?: number) => void
  // Dọn sạch bàn khi tất cả khách rời đi
  resetTable: (tableId: string) => void
  // Đánh dấu nhận bàn (tương thích backward & gọi từ checkout)
  occupyTable: (tableId: string, customerInfo?: string, seatCount?: number) => void
  // Chuyển bàn: giải phóng bàn cũ và tăng chỗ lấp đầy bàn mới
  switchTable: (oldTableId: string | null, newTableId: string, customerInfo?: string, seatCount?: number) => void
  // Đặt lại dữ liệu mẫu
  resetAllToDefault: () => void
  // Các helper tính toán thống kê
  getTotalSeats: () => number
  getTotalOccupiedSeats: () => number
  getTotalAvailableSeats: () => number
  getAvailableCount: () => number
  getOccupiedCount: () => number
  getPartialCount: () => number
  getEmptyCount: () => number
}

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      tables: MOCK_TABLES,

      // Khi có khách order hoặc nhận chỗ vào bàn: tăng số chỗ lấp đầy
      addCustomerToTable: (tableId: string, customerName?: string, seatCount: number = 1) => {
        const nowIso = new Date().toISOString()
        const seatsToAdd = Math.max(1, seatCount)
        const name = (customerName || '').trim() || 'Khách đặt món'

        set((state) => ({
          tables: state.tables.map((t) => {
            if (t.id !== tableId) return t

            const currentOccupied = typeof t.occupied_seats === 'number' ? t.occupied_seats : 0
            const newOccupied = Math.min(t.capacity, currentOccupied + seatsToAdd)
            const newStatus = calculateTableStatus(newOccupied, t.capacity)
            const existingCustomers = Array.isArray(t.customers) ? t.customers : []
            const updatedCustomers = [...existingCustomers, name]

            return {
              ...t,
              occupied_seats: newOccupied,
              status: newStatus,
              occupied_at: t.occupied_at || nowIso,
              current_customer: name,
              customers: updatedCustomers,
              updated_at: nowIso,
            }
          }),
        }))
      },

      // Khi có 1 hoặc nhiều khách trong bàn rời đi: giảm số chỗ lấp đầy
      removeCustomerFromTable: (tableId: string, seatCount: number = 1) => {
        const nowIso = new Date().toISOString()
        const seatsToRemove = Math.max(1, seatCount)

        set((state) => ({
          tables: state.tables.map((t) => {
            if (t.id !== tableId) return t

            const currentOccupied = typeof t.occupied_seats === 'number' ? t.occupied_seats : 0
            const newOccupied = Math.max(0, currentOccupied - seatsToRemove)
            const newStatus = calculateTableStatus(newOccupied, t.capacity)
            const existingCustomers = Array.isArray(t.customers) ? [...t.customers] : []
            if (existingCustomers.length > 0) {
              existingCustomers.pop()
            }

            return {
              ...t,
              occupied_seats: newOccupied,
              status: newStatus,
              occupied_at: newOccupied === 0 ? null : t.occupied_at,
              current_customer: existingCustomers.length > 0 ? existingCustomers[existingCustomers.length - 1] : null,
              customers: existingCustomers,
              updated_at: nowIso,
            }
          }),
        }))
      },

      // Reset hoàn toàn bàn khi tất cả khách rời đi
      resetTable: (tableId: string) => {
        const nowIso = new Date().toISOString()
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  occupied_seats: 0,
                  status: 'AVAILABLE',
                  occupied_at: null,
                  current_customer: null,
                  customers: [],
                  updated_at: nowIso,
                }
              : t
          ),
        }))
      },

      // Đánh dấu lấp đầy bàn (gọi từ checkout hoặc nút khách vào)
      occupyTable: (tableId: string, customerInfo?: string, seatCount: number = 1) => {
        const nowIso = new Date().toISOString()
        const name = (customerInfo || '').trim() || 'Khách đặt món'
        const count = Math.max(1, seatCount)

        set((state) => ({
          tables: state.tables.map((t) => {
            if (t.id !== tableId) return t

            const currentOccupied = typeof t.occupied_seats === 'number' ? t.occupied_seats : 0
            const existingCustomers = Array.isArray(t.customers) ? t.customers : []
            const isAlreadyPresent = existingCustomers.includes(name)
            const newOccupied = isAlreadyPresent
              ? currentOccupied
              : Math.min(t.capacity, currentOccupied + count)
            const newStatus = calculateTableStatus(newOccupied, t.capacity)
            const updatedCustomers = isAlreadyPresent ? existingCustomers : [...existingCustomers, name]

            return {
              ...t,
              occupied_seats: newOccupied,
              status: newStatus,
              occupied_at: t.occupied_at || nowIso,
              current_customer: name,
              customers: updatedCustomers,
              updated_at: nowIso,
            }
          }),
        }))
      },

      // Chuyển bàn: giải phóng bàn cũ và chiếm chỗ tại bàn mới
      switchTable: (oldTableId: string | null, newTableId: string, customerInfo?: string, seatCount: number = 1) => {
        const nowIso = new Date().toISOString()
        const count = Math.max(1, seatCount)
        const name = (customerInfo || '').trim() || 'Khách đặt món'

        set((state) => ({
          tables: state.tables.map((t) => {
            // Giảm bớt chỗ tại bàn cũ
            if (oldTableId && t.id === oldTableId && t.id !== newTableId) {
              const currentOccupied = typeof t.occupied_seats === 'number' ? t.occupied_seats : 0
              const newOccupied = Math.max(0, currentOccupied - count)
              const existingCustomers = Array.isArray(t.customers) ? t.customers.filter((c) => c !== name) : []

              return {
                ...t,
                occupied_seats: newOccupied,
                status: calculateTableStatus(newOccupied, t.capacity),
                occupied_at: newOccupied === 0 ? null : t.occupied_at,
                current_customer: existingCustomers.length > 0 ? existingCustomers[existingCustomers.length - 1] : null,
                customers: existingCustomers,
                updated_at: nowIso,
              }
            }

            // Tăng chỗ tại bàn mới (tránh cộng dồn nếu cùng tên đã có)
            if (t.id === newTableId) {
              const currentOccupied = typeof t.occupied_seats === 'number' ? t.occupied_seats : 0
              const existingCustomers = Array.isArray(t.customers) ? t.customers : []
              const isAlreadyPresent = existingCustomers.includes(name)
              const newOccupied = isAlreadyPresent
                ? currentOccupied
                : Math.min(t.capacity, currentOccupied + count)
              const updatedCustomers = isAlreadyPresent ? existingCustomers : [...existingCustomers, name]

              return {
                ...t,
                occupied_seats: newOccupied,
                status: calculateTableStatus(newOccupied, t.capacity),
                occupied_at: t.occupied_at || nowIso,
                current_customer: name,
                customers: updatedCustomers,
                updated_at: nowIso,
              }
            }

            return t
          }),
        }))
      },

      resetAllToDefault: () => {
        set({ tables: MOCK_TABLES })
      },

      // Helper getters
      getTotalSeats: () => {
        return get().tables.reduce((sum, t) => sum + (t.capacity || 0), 0)
      },

      getTotalOccupiedSeats: () => {
        return get().tables.reduce((sum, t) => sum + (typeof t.occupied_seats === 'number' ? t.occupied_seats : 0), 0)
      },

      getTotalAvailableSeats: () => {
        const total = get().getTotalSeats()
        const occupied = get().getTotalOccupiedSeats()
        return Math.max(0, total - occupied)
      },

      // Bàn còn chỗ (chưa lấp đầy 100%)
      getAvailableCount: () => {
        return get().tables.filter((t) => (t.occupied_seats || 0) < t.capacity).length
      },

      // Bàn đã kín chỗ (lấp đầy 100%)
      getOccupiedCount: () => {
        return get().tables.filter((t) => (t.occupied_seats || 0) >= t.capacity).length
      },

      // Bàn đang phục vụ một phần (0 < occupied < capacity)
      getPartialCount: () => {
        return get().tables.filter((t) => {
          const occ = t.occupied_seats || 0
          return occ > 0 && occ < t.capacity
        }).length
      },

      // Bàn trống hoàn toàn (occupied === 0)
      getEmptyCount: () => {
        return get().tables.filter((t) => (t.occupied_seats || 0) === 0).length
      },
    }),
    {
      name: 'coffee-table-status-store',
      version: 7,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState || version < 7 || !Array.isArray(persistedState.tables) || persistedState.tables.length === 0) {
          return { tables: MOCK_TABLES }
        }
        return persistedState
      },
      merge: (persistedState: any, currentState: TableState) => {
        if (!persistedState || !Array.isArray(persistedState.tables) || persistedState.tables.length === 0) {
          return { ...currentState, tables: MOCK_TABLES }
        }

        const persistedTableMap = new Map((persistedState.tables as Table[]).map((t) => [t.id, t]))
        const mergedTables = MOCK_TABLES.map((defaultTable) => {
          const existing = persistedTableMap.get(defaultTable.id)
          if (!existing) return defaultTable

          const rawCustomers = Array.isArray(existing.customers)
            ? existing.customers
            : (existing.current_customer ? [existing.current_customer] : defaultTable.customers || [])

          // Lọc bỏ các chuỗi gõ phím dở dang như ['v', 'vg', 'vgh', 'vghh', 'vghhg']
          const cleanCustomers = rawCustomers.filter((c, i, arr) => {
            const trimmed = (c || '').trim()
            if (!trimmed || trimmed === 'Khách đặt món tại checkout') return false
            const isPrefix = arr.slice(i + 1).some((next) => next.startsWith(trimmed) && next.length > trimmed.length)
            return !isPrefix
          })

          const hadTypingBug = rawCustomers.length > cleanCustomers.length || rawCustomers.some((c) => c.includes('vgh'))

          let occupiedSeats = typeof existing.occupied_seats === 'number'
            ? existing.occupied_seats
            : (existing.status === 'OCCUPIED' ? defaultTable.capacity : (defaultTable.occupied_seats || 0))

          let finalCustomers = cleanCustomers

          // Nếu bàn bị dính lỗi gõ phím làm phình số chỗ (như Bàn 09 từ 'vghhg')
          if (hadTypingBug) {
            if (existing.id === 't9') {
              occupiedSeats = defaultTable.occupied_seats || 0
              finalCustomers = defaultTable.customers || []
            } else {
              occupiedSeats = Math.min(defaultTable.capacity, cleanCustomers.length)
            }
          }

          const status = calculateTableStatus(occupiedSeats, defaultTable.capacity)

          return {
            ...defaultTable,
            ...existing,
            capacity: defaultTable.capacity,
            occupied_seats: occupiedSeats,
            status,
            customers: finalCustomers,
            current_customer: finalCustomers.length > 0 ? finalCustomers[finalCustomers.length - 1] : null,
          }
        })

        return {
          ...currentState,
          ...persistedState,
          tables: mergedTables,
        }
      },
    }
  )
)
