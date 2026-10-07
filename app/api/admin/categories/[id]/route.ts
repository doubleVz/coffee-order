import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createServiceRoleClient()

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) {
      updateData.name = body.name
      updateData.slug = slugify(body.name)
    }
    if (body.description !== undefined) updateData.description = body.description
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Category update error:', error)
      return NextResponse.json({ error: 'Không thể cập nhật danh mục' }, { status: 500 })
    }

    return NextResponse.json({ category: data })
  } catch (error) {
    console.error('Category PATCH error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServiceRoleClient()

    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      console.error('Category delete error:', error)
      if (error.code === '23503') {
        return NextResponse.json(
          { error: 'Không thể xóa danh mục còn sản phẩm' },
          { status: 400 }
        )
      }
      return NextResponse.json({ error: 'Không thể xóa danh mục' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Category DELETE error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
