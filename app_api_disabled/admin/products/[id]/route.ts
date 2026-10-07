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
    if (body.price !== undefined) updateData.price = body.price
    if (body.category_id !== undefined) updateData.category_id = body.category_id
    if (body.image_url !== undefined) updateData.image_url = body.image_url
    if (body.is_available !== undefined) updateData.is_available = body.is_available
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured
    if (body.is_best_seller !== undefined) updateData.is_best_seller = body.is_best_seller
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()

    if (error) {
      console.error('Product update error:', error)
      return NextResponse.json({ error: 'Không thể cập nhật sản phẩm' }, { status: 500 })
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Product PATCH error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServiceRoleClient()

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      console.error('Product delete error:', error)
      return NextResponse.json({ error: 'Không thể xóa sản phẩm' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product DELETE error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
