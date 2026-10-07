import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createServiceRoleClient()

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.capacity !== undefined) updateData.capacity = body.capacity
    if (body.is_active !== undefined) updateData.is_active = body.is_active

    const { data, error } = await supabase
      .from('tables')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Table update error:', error)
      return NextResponse.json({ error: 'Không thể cập nhật bàn' }, { status: 500 })
    }

    return NextResponse.json({ table: data })
  } catch (error) {
    console.error('Table PATCH error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServiceRoleClient()

    const { error } = await supabase.from('tables').delete().eq('id', id)

    if (error) {
      console.error('Table delete error:', error)
      return NextResponse.json({ error: 'Không thể xóa bàn' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Table DELETE error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
