import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const supabase = await createServiceRoleClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')

    if (error) throw error
    return NextResponse.json({ categories: data })
  } catch (error) {
    console.error('Categories GET error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createServiceRoleClient()

    const slug = slugify(body.name)
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: body.name,
        slug,
        description: body.description || null,
        image_url: body.image_url || null,
        is_active: body.is_active ?? true,
        sort_order: body.sort_order ?? 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Category create error:', error)
      return NextResponse.json({ error: 'Không thể tạo danh mục' }, { status: 500 })
    }

    return NextResponse.json({ category: data }, { status: 201 })
  } catch (error) {
    console.error('Categories POST error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
