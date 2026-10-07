import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { createOrderSchema } from '@/lib/validations'

// Size price adjustments map
const SIZE_PRICE_MAP: Record<string, number> = {
  'M': 0,
  'L': 10000,
}

// Topping price map
const TOPPING_PRICE_MAP: Record<string, number> = {
  'Trân châu': 10000,
  'Thạch': 8000,
  'Kem cheese': 15000,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = createOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabase = await createServiceRoleClient()

    // Verify table exists and is active (if provided)
    if (data.table_id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.table_id)
      let tableQuery = supabase.from('tables').select('id, is_active')
      if (isUuid) {
        tableQuery = tableQuery.eq('id', data.table_id)
      } else {
        tableQuery = tableQuery.or(`code.ilike.%${data.table_id}%,name.ilike.%${data.table_id}%`)
      }
      const { data: table, error: tableError } = await tableQuery.maybeSingle()

      if (tableError || !table || !table.is_active) {
        return NextResponse.json(
          { error: 'Bàn không hợp lệ hoặc không hoạt động' },
          { status: 400 }
        )
      }
      data.table_id = table.id
    }

    // Verify products and calculate prices server-side
    const productIds = data.items.map((item) => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, is_available')
      .in('id', productIds)

    if (productsError || !products) {
      return NextResponse.json(
        { error: 'Không thể lấy thông tin sản phẩm' },
        { status: 500 }
      )
    }

    // Check all products exist and are available
    const productMap = new Map(products.map((p) => [p.id, p]))
    for (const item of data.items) {
      const product = productMap.get(item.product_id)
      if (!product) {
        return NextResponse.json(
          { error: `Sản phẩm không tồn tại: ${item.product_id}` },
          { status: 400 }
        )
      }
      if (!product.is_available) {
        return NextResponse.json(
          { error: `Sản phẩm đã hết: ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Fetch actual option prices from database for verification
    const { data: allOptions } = await supabase
      .from('product_options')
      .select('*, values:product_option_values(*)')
      .in('product_id', productIds)

    // Build option price lookup
    const optionPriceLookup = new Map<string, Map<string, number>>()
    if (allOptions) {
      for (const opt of allOptions) {
        if (!optionPriceLookup.has(opt.product_id)) {
          optionPriceLookup.set(opt.product_id, new Map())
        }
        const productOpts = optionPriceLookup.get(opt.product_id)!
        if (opt.values) {
          for (const val of opt.values) {
            productOpts.set(`${opt.name}:${val.label}`, val.price_adjustment)
          }
        }
      }
    }

    // Calculate order items with server-side pricing
    let subtotal = 0
    const orderItems = data.items.map((item) => {
      const product = productMap.get(item.product_id)!
      let unitPrice = product.price
      const optionParts: string[] = []
      const productOpts = optionPriceLookup.get(item.product_id)

      // Size adjustment
      if (item.size) {
        const sizePrice = productOpts?.get(`Size:${item.size}`) ?? SIZE_PRICE_MAP[item.size] ?? 0
        unitPrice += sizePrice
        optionParts.push(`Size ${item.size}`)
      }

      // Sugar
      if (item.sugar) {
        optionParts.push(`Đường ${item.sugar}`)
      }

      // Ice
      if (item.ice) {
        optionParts.push(`Đá ${item.ice}`)
      }

      // Toppings
      if (item.toppings && item.toppings.length > 0) {
        for (const topping of item.toppings) {
          const toppingPrice = productOpts?.get(`Topping:${topping}`) ?? TOPPING_PRICE_MAP[topping] ?? 0
          unitPrice += toppingPrice
          optionParts.push(topping)
        }
      }

      const itemSubtotal = unitPrice * item.quantity
      subtotal += itemSubtotal

      return {
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: itemSubtotal,
        options: {
          size: item.size,
          sugar: item.sugar,
          ice: item.ice,
          toppings: item.toppings,
        },
        options_text: optionParts.length > 0 ? optionParts.join(', ') : null,
        note: item.note || null,
      }
    })

    const total = subtotal // No service fee in MVP

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: data.table_id,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        note: data.note || null,
        subtotal,
        total,
        payment_method: data.payment_method,
        status: 'PENDING',
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Không thể tạo đơn hàng' },
        { status: 500 }
      )
    }

    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        orderItems.map((item) => ({
          ...item,
          order_id: order.id,
        }))
      )

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Không thể tạo chi tiết đơn hàng' },
        { status: 500 }
      )
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json(
      { error: 'Lỗi hệ thống' },
      { status: 500 }
    )
  }
}

// GET - fetch orders (admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServiceRoleClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const search = searchParams.get('search')

    let query = supabase
      .from('orders')
      .select('*, table:tables(*), order_items(*)')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (date) {
      const startOfDay = `${date}T00:00:00+07:00`
      const endOfDay = `${date}T23:59:59+07:00`
      query = query.gte('created_at', startOfDay).lte('created_at', endOfDay)
    }

    if (search) {
      query = query.or(`order_code.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      console.error('Fetch orders error:', error)
      return NextResponse.json({ error: 'Không thể lấy danh sách đơn hàng' }, { status: 500 })
    }

    return NextResponse.json({ orders: data })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
