import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServiceRoleClient()

    // Get today's date range in Vietnam timezone
    const now = new Date()
    const vnOffset = 7 * 60 * 60 * 1000
    const vnNow = new Date(now.getTime() + vnOffset)
    const todayStr = vnNow.toISOString().split('T')[0]
    const startOfDay = `${todayStr}T00:00:00+07:00`
    const endOfDay = `${todayStr}T23:59:59+07:00`

    // Today's orders
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    const orders = todayOrders || []
    const totalOrdersToday = orders.length
    const revenueToday = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0)
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length
    const preparingOrders = orders.filter((o) => o.status === 'PREPARING' || o.status === 'CONFIRMED').length
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length

    // Top 5 products
    const { data: recentItems } = await supabase
      .from('order_items')
      .select('product_name, quantity, order_id')
    
    const productCounts = new Map<string, number>()
    if (recentItems) {
      for (const item of recentItems) {
        const current = productCounts.get(item.product_name) || 0
        productCounts.set(item.product_name, current + item.quantity)
      }
    }
    const topProducts = Array.from(productCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Revenue by day (last 7 days)
    const revenueByDay: { date: string; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(vnNow.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      const dayStart = `${dateStr}T00:00:00+07:00`
      const dayEnd = `${dateStr}T23:59:59+07:00`
      
      const { data: dayOrders } = await supabase
        .from('orders')
        .select('total, status')
        .gte('created_at', dayStart)
        .lte('created_at', dayEnd)
        .neq('status', 'CANCELLED')

      const dayRevenue = (dayOrders || []).reduce((sum, o) => sum + o.total, 0)
      revenueByDay.push({ date: dateStr, revenue: dayRevenue })
    }

    return NextResponse.json({
      totalOrdersToday,
      revenueToday,
      pendingOrders,
      preparingOrders,
      completedOrders,
      topProducts,
      revenueByDay,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
