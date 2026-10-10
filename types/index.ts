// Database types for Coffee Order System

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'

export type PaymentMethod = 'CASH' | 'COUNTER'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  is_best_seller: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface ProductOption {
  id: string
  product_id: string
  name: string
  type: 'RADIO' | 'CHECKBOX'
  is_required: boolean
  sort_order: number
  values: ProductOptionValue[]
}

export interface ProductOptionValue {
  id: string
  option_id: string
  label: string
  price_adjustment: number
  is_default: boolean
  sort_order: number
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'PARTIAL'

export interface Table {
  id: string
  name: string
  code: string
  capacity: number // Tổng số chỗ ngồi của bàn
  occupied_seats?: number // Số lượng chỗ đã được lấp đầy (0 <= occupied_seats <= capacity)
  is_active: boolean
  status?: TableStatus
  occupied_at?: string | null
  current_customer?: string | null
  customers?: string[] // Danh sách các khách hàng đã order/ngồi vào bàn này
  area?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_code: string
  table_id: string | null
  customer_name: string
  customer_phone: string
  note: string | null
  subtotal: number
  total: number
  payment_method: PaymentMethod
  status: OrderStatus
  created_at: string
  updated_at: string
  table?: Table
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
  options: Record<string, string | string[]> | null
  options_text: string | null
  note: string | null
}

// Cart types (client-side)
export interface CartItemOption {
  name: string
  value: string
  priceAdjustment: number
}

export interface CartItemTopping {
  name: string
  price: number
}

export interface CartItem {
  id: string // unique cart item id
  productId: string
  productName: string
  productImage: string | null
  basePrice: number
  size: string | null
  sugar: string | null
  ice: string | null
  toppings: CartItemTopping[]
  quantity: number
  note: string | null
  unitPrice: number // basePrice + size adjustment + toppings
  subtotal: number // unitPrice * quantity
}

export interface CartState {
  items: CartItem[]
  tableId: string | null
  tableName: string | null
  addItem: (item: Omit<CartItem, 'id' | 'subtotal'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setTable: (id: string, name: string) => void
  getTotal: () => number
  getItemCount: () => number
}

// Form types
export interface CheckoutFormData {
  customerName: string
  customerPhone: string
  note: string
  paymentMethod: PaymentMethod
}

export interface CreateOrderPayload {
  table_id: string | null
  customer_name: string
  customer_phone: string
  note: string | null
  payment_method: PaymentMethod
  items: {
    product_id: string
    quantity: number
    size: string | null
    sugar: string | null
    ice: string | null
    toppings: string[]
    note: string | null
  }[]
}

// Dashboard stats
export interface DashboardStats {
  totalOrdersToday: number
  revenueToday: number
  pendingOrders: number
  preparingOrders: number
  completedOrders: number
  topProducts: { name: string; count: number }[]
  revenueByDay: { date: string; revenue: number }[]
}

export interface AdminUser {
  id: string
  email: string
  role: string
}
