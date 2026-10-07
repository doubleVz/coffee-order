import { z } from 'zod'

export const checkoutSchema = z.object({
  customerName: z.string().min(1, 'Vui lòng nhập tên').max(100, 'Tên quá dài'),
  customerPhone: z
    .string()
    .min(1, 'Vui lòng nhập số điện thoại')
    .regex(/^(0[3|5|7|8|9])[0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  note: z.string().max(500, 'Ghi chú quá dài').optional().default(''),
  paymentMethod: z.enum(['CASH', 'COUNTER']),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên sản phẩm').max(200),
  description: z.string().max(1000).optional().default(''),
  price: z.number().min(0, 'Giá phải >= 0').max(10000000, 'Giá quá lớn'),
  category_id: z.string().min(1, 'Vui lòng chọn danh mục'),
  image_url: z.string().url().optional().or(z.literal('')),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  is_best_seller: z.boolean().default(false),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên danh mục').max(100),
  description: z.string().max(500).optional().default(''),
  image_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
})

export const tableSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên bàn').max(50),
  capacity: z.number().int().min(1, 'Sức chứa ít nhất 1').max(50).default(4),
  is_active: z.boolean().default(true),
})

export const orderItemSchema = z.object({
  product_id: z.string().min(1, 'Product ID không hợp lệ'),
  quantity: z.number().int().min(1, 'Số lượng ít nhất 1').max(99),
  size: z.string().nullable().optional(),
  sugar: z.string().nullable().optional(),
  ice: z.string().nullable().optional(),
  toppings: z.array(z.string()).default([]),
  note: z.string().max(200).nullable().optional(),
})

export const createOrderSchema = z.object({
  table_id: z.string().nullable().optional(),
  customer_name: z.string().min(1, 'Vui lòng nhập tên').max(100),
  customer_phone: z
    .string()
    .min(1, 'Vui lòng nhập SĐT')
    .regex(/^(0[3|5|7|8|9])[0-9]{8}$/, 'SĐT không hợp lệ'),
  note: z.string().max(500).nullable().optional(),
  payment_method: z.enum(['CASH', 'COUNTER']),
  items: z.array(orderItemSchema).min(1, 'Giỏ hàng trống'),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
export type ProductFormValues = z.infer<typeof productSchema>
export type CategoryFormValues = z.infer<typeof categorySchema>
export type TableFormValues = z.infer<typeof tableSchema>
export type CreateOrderValues = z.infer<typeof createOrderSchema>
