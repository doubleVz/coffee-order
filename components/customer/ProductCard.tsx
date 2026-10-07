'use client'

import { Plus, Star, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onClick: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const isOutOfStock = !product.is_available

  return (
    <div
      className={`group relative bg-white rounded-3xl overflow-hidden border border-amber-950/5 coffee-card-shadow coffee-card-hover flex flex-col cursor-pointer transition-all ${
        isOutOfStock ? 'opacity-65 grayscale-[30%]' : ''
      }`}
      onClick={isOutOfStock ? undefined : onClick}
      role="button"
      tabIndex={isOutOfStock ? -1 : 0}
      onKeyDown={(e) => {
        if (!isOutOfStock && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`${product.name} - ${formatCurrency(product.price)}`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#F8F3EA] to-[#EDE5D8]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            ☕
          </div>
        )}

        {/* Gradient vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.is_best_seller && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              <Star className="h-3 w-3 fill-current" />
              Bán chạy
            </span>
          )}
          {product.is_featured && !product.is_best_seller && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md">
              <Sparkles className="h-3 w-3" />
              Đặc sắc
            </span>
          )}
        </div>

        {/* Out of Stock Notice */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-white/95 text-stone-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg">
              Tạm hết món
            </span>
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {product.category?.name && (
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700/80 mb-1 block">
              {product.category.name}
            </span>
          )}
          <h3 className="font-bold text-[#231709] text-base group-hover:text-amber-800 transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-stone-400 font-medium">Giá chỉ từ</span>
            <span className="text-lg font-extrabold text-[#B26A3B] tracking-tight">
              {formatCurrency(product.price)}
            </span>
          </div>

          {!isOutOfStock && (
            <button
              className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#654321] to-[#B26A3B] text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-108 active:scale-95 transition-all"
              aria-label={`Thêm ${product.name}`}
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
export default ProductCard
