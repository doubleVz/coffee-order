import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      )
    }

    const supabase = await createServiceRoleClient()

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*, table:tables(*), order_items(*)')
      .single()

    if (error) {
      console.error('Update order error:', error)
      return NextResponse.json(
        { error: 'Không thể cập nhật đơn hàng' },
        { status: 500 }
      )
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error('Order PATCH error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServiceRoleClient()

    const { data, error } = await supabase
      .from('orders')
      .select('*, table:tables(*), order_items(*)')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 })
    }

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error('Order GET error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
