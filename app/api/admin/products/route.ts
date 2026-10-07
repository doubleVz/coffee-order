import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const supabase = await createServiceRoleClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .order('sort_order')

    if (error) throw error
    return NextResponse.json({ products: data })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createServiceRoleClient()

    const slug = slugify(body.name)
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        slug,
        description: body.description || null,
        price: body.price,
        category_id: body.category_id,
        image_url: body.image_url || null,
        is_available: body.is_available ?? true,
        is_featured: body.is_featured ?? false,
        is_best_seller: body.is_best_seller ?? false,
        sort_order: body.sort_order ?? 0,
      })
      .select('*, category:categories(*)')
      .single()

    if (error) {
      console.error('Product create error:', error)
      return NextResponse.json({ error: 'Không thể tạo sản phẩm' }, { status: 500 })
    }

    return NextResponse.json({ product: data }, { status: 201 })
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
