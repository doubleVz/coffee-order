import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServiceRoleClient()
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('name')

    if (error) throw error
    return NextResponse.json({ tables: data })
  } catch (error) {
    console.error('Tables GET error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createServiceRoleClient()

    // Generate code from name
    const code = body.name.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/\s+/g, '') || `BAN${Date.now()}`

    const { data, error } = await supabase
      .from('tables')
      .insert({
        name: body.name,
        code,
        capacity: body.capacity ?? 4,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Table create error:', error)
      return NextResponse.json({ error: 'Không thể tạo bàn' }, { status: 500 })
    }

    return NextResponse.json({ table: data }, { status: 201 })
  } catch (error) {
    console.error('Tables POST error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
