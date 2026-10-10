'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Coffee, Sparkles, X, SlidersHorizontal, Flame, Leaf, IceCreamCone, Cake, GlassWater } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductCard } from '@/components/customer/ProductCard'
import { ProductDetailModal } from '@/components/customer/ProductDetailModal'
import { TableBanner } from '@/components/customer/TableBanner'
import type { Product, Category, ProductOption } from '@/types'
import { useCartStore } from '@/lib/store/cart-store'
import { useTableStore } from '@/lib/store/table-store'
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_OPTIONS_FOR_DRINKS } from '@/lib/data/mock-data'
import toast from 'react-hot-toast'

const categoryIcons: Record<string, React.ReactNode> = {
  'ca-phe': <Coffee className="h-4 w-4" />,
  'tra': <Leaf className="h-4 w-4" />,
  'da-xay': <IceCreamCone className="h-4 w-4" />,
  'nuoc-ep': <GlassWater className="h-4 w-4" />,
  'banh': <Cake className="h-4 w-4" />,
}

export function MenuContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('category') || 'all'
    }
    return 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular'>('default')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const setTable = useCartStore((s) => s.setTable)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tableId = params.get('table')

    async function loadData() {
      try {
        const supabase = createClient()

        const [catsRes, prodsRes] = await Promise.allSettled([
          supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('products').select('*, category:categories(*)').eq('is_available', true).order('sort_order'),
        ])

        const loadedCats =
          catsRes.status === 'fulfilled' && catsRes.value?.data && catsRes.value.data.length > 0
            ? (catsRes.value.data as Category[])
            : MOCK_CATEGORIES

        const loadedProds =
          prodsRes.status === 'fulfilled' && prodsRes.value?.data && prodsRes.value.data.length > 0
            ? (prodsRes.value.data as Product[])
            : MOCK_PRODUCTS

        setCategories(loadedCats)
        setProducts(loadedProds)

        if (tableId) {
          const storeTables = useTableStore.getState().tables
          const matched = storeTables.find(
            (t) =>
              t.id.toLowerCase() === tableId.toLowerCase() ||
              t.code.toLowerCase() === tableId.toLowerCase() ||
              t.name.toLowerCase().includes(tableId.toLowerCase())
          )

          if (matched) {
            const occ = typeof matched.occupied_seats === 'number' ? matched.occupied_seats : 0
            if (occ >= matched.capacity) {
              toast.error(`⛔ ${matched.name} hiện đã kín chỗ (${occ}/${matched.capacity})! Không thể chọn bàn này.`, {
                icon: '⛔',
                duration: 4000,
              })
            } else {
              setTable(matched.id, matched.name)
            }
          } else {
            try {
              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tableId)
              let tQuery = supabase.from('tables').select('*').eq('is_active', true)
              if (isUuid) {
                tQuery = tQuery.eq('id', tableId)
              } else {
                tQuery = tQuery.or(`code.ilike.%${tableId}%,name.ilike.%${tableId}%`)
              }
              const { data: table } = await tQuery.maybeSingle()
              if (table) {
                const occ = typeof table.occupied_seats === 'number' ? table.occupied_seats : 0
                if (occ >= table.capacity) {
                  toast.error(`⛔ ${table.name} hiện đã kín chỗ! Không thể chọn bàn này.`, { icon: '⛔' })
                } else {
                  setTable(table.id, table.name)
                }
              }
            } catch {
              setTable(tableId, `Bàn ${tableId}`)
            }
          }
        }
      } catch (err) {
        console.warn('Using fallback mock data due to:', err)
        setCategories(MOCK_CATEGORIES)
        setProducts(MOCK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [setTable])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category?.slug === selectedCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
    }

    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0))
    }

    return filtered
  }, [products, selectedCategory, searchQuery, sortBy])

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product)
    try {
      const supabase = createClient()
      const { data: options } = await supabase
        .from('product_options')
        .select('*, values:product_option_values(*)')
        .eq('product_id', product.id)
        .order('sort_order')

      if (options && options.length > 0) {
        setProductOptions(options as ProductOption[])
      } else {
        setProductOptions(MOCK_OPTIONS_FOR_DRINKS)
      }
    } catch {
      setProductOptions(MOCK_OPTIONS_FOR_DRINKS)
    }
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-amber-200 border-t-amber-700 animate-spin" />
          <Coffee className="w-7 h-7 text-amber-800 absolute inset-0 m-auto" />
        </div>
        <p className="mt-5 text-base font-semibold text-[#654321] tracking-wide animate-pulse">
          Đang chuẩn bị thực đơn hảo hạng...
        </p>
      </div>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <TableBanner />

      {/* Header Banner */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#231709] via-[#382314] to-[#654321] p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none hidden sm:block">
          <img
            src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop"
            alt="Coffee beans"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Thực đơn pha chế đặc biệt
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Khám phá hương vị cafe nguyên bản
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-300">
            Chọn món yêu thích, tùy chỉnh size & lượng đường đá chuẩn gu ngay tại bàn chỉ trong 30 giây.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên món (Espresso, Trà đào, Tiramisu...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border-2 border-stone-200 bg-white text-sm text-[#231709] placeholder:text-stone-400 focus:outline-none focus:border-[#B26A3B] transition-colors shadow-sm"
            aria-label="Tìm kiếm món"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs font-medium text-stone-500 hidden sm:inline flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Sắp xếp:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border-2 border-stone-200 text-stone-700 text-xs sm:text-sm font-semibold rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-[#B26A3B] shadow-sm cursor-pointer"
          >
            <option value="default">Thứ tự chuẩn</option>
            <option value="popular">Bán chạy nhất 🔥</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-2.5 min-w-max">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-[#654321] to-[#B26A3B] text-white shadow-amber-900/20 scale-102'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-amber-400 hover:bg-[#FAF7F2]'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Tất cả</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              {products.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category?.slug === cat.slug).length
            const isSelected = selectedCategory === cat.slug

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#654321] to-[#B26A3B] text-white shadow-amber-900/20 scale-102'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-amber-400 hover:bg-[#FAF7F2]'
                }`}
              >
                {categoryIcons[cat.slug] || <Coffee className="h-4 w-4" />}
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Result counter indicator */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Hiển thị {filteredProducts.length} món ngon
        </span>
        {searchQuery && (
          <span className="text-xs text-amber-800 font-medium">
            Kết quả cho &ldquo;{searchQuery}&rdquo;
          </span>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 shadow-sm p-8 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <Coffee className="h-8 w-8 text-amber-700" />
          </div>
          <h3 className="text-lg font-bold text-[#231709]">Không tìm thấy món phù hợp</h3>
          <p className="mt-1.5 text-xs text-stone-500">
            Hãy thử tìm bằng từ khóa khác hoặc chuyển sang danh mục khác xem nhé!
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#654321] text-white text-xs font-bold hover:bg-[#523518] transition-colors"
          >
            Xem toàn bộ Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct.id}
          product={selectedProduct}
          options={productOptions}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </main>
  )
}
export default MenuContent
