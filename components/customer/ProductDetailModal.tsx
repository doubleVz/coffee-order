'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart-store'
import type { Product, ProductOption, CartItemTopping } from '@/types'
import { MOCK_OPTIONS_FOR_DRINKS } from '@/lib/data/mock-data'
import toast from 'react-hot-toast'

interface Props {
  product: Product
  options: ProductOption[]
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailModal({ product, options, isOpen, onClose }: Props) {
  const effectiveOptions =
    options && options.length > 0
      ? options
      : product.category?.slug !== 'banh'
      ? MOCK_OPTIONS_FOR_DRINKS
      : []

  const sizeOption = effectiveOptions.find((o) => o.name === 'Size')
  const sugarOption = effectiveOptions.find((o) => o.name === 'Đường')
  const iceOption = effectiveOptions.find((o) => o.name === 'Đá')
  const toppingOption = effectiveOptions.find((o) => o.name === 'Topping')

  const defaultSizeVal = sizeOption?.values?.find((v) => v.is_default) || sizeOption?.values?.[0]
  const defaultSugarVal = sugarOption?.values?.find((v) => v.is_default) || sugarOption?.values?.[0]
  const defaultIceVal = iceOption?.values?.find((v) => v.is_default) || iceOption?.values?.[0]

  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string | null>(defaultSizeVal?.label || null)
  const [sizePriceAdj, setSizePriceAdj] = useState(defaultSizeVal?.price_adjustment || 0)
  const [selectedSugar, setSelectedSugar] = useState<string | null>(defaultSugarVal?.label || null)
  const [selectedIce, setSelectedIce] = useState<string | null>(defaultIceVal?.label || null)
  const [selectedToppings, setSelectedToppings] = useState<CartItemTopping[]>([])
  const [note, setNote] = useState('')
  const addItem = useCartStore((s) => s.addItem)

  const toppingTotal = selectedToppings.reduce((sum, t) => sum + t.price, 0)
  const unitPrice = product.price + sizePriceAdj + toppingTotal
  const totalPrice = unitPrice * quantity

  const handleSizeChange = (label: string) => {
    setSelectedSize(label)
    const val = sizeOption?.values?.find((v) => v.label === label)
    setSizePriceAdj(val?.price_adjustment || 0)
  }

  const handleToppingToggle = (label: string, price: number) => {
    setSelectedToppings((prev) => {
      const exists = prev.find((t) => t.name === label)
      if (exists) {
        return prev.filter((t) => t.name !== label)
      }
      return [...prev, { name: label, price }]
    })
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.image_url,
      basePrice: product.price,
      size: selectedSize,
      sugar: selectedSugar,
      ice: selectedIce,
      toppings: selectedToppings,
      quantity,
      note: note.trim() || null,
      unitPrice,
    })
    toast.success(`Đã thêm ${quantity}x "${product.name}" vào giỏ hàng`, {
      icon: '☕',
      style: {
        borderRadius: '16px',
        background: '#231709',
        color: '#FFFDF8',
        fontWeight: 500,
      },
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-3xl border-stone-200/80 shadow-2xl max-h-[90vh] flex flex-col bg-[#FAF7F2]">
        {/* Product Image Header */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900 shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              ☕
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges on image */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-300">
                {product.category?.name || 'Thức uống đặc biệt'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                {product.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-300 font-medium block">Giá cơ bản</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 drop-shadow-md">
                {formatCurrency(product.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {product.description && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-stone-200/60">
              {product.description}
            </p>
          )}

          {/* Size Option */}
          {sizeOption && sizeOption.values && sizeOption.values.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-[#231709] uppercase tracking-wider">
                  1. Chọn Size <span className="text-amber-700">*</span>
                </label>
                <span className="text-[11px] text-stone-400 font-medium">Bắt buộc</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {sizeOption.values
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((val) => {
                    const isSelected = selectedSize === val.label
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => handleSizeChange(val.label)}
                        className={`flex items-center justify-between p-3 rounded-2xl text-sm font-semibold border-2 transition-all ${
                          isSelected
                            ? 'border-[#B26A3B] bg-[#FFF8F0] text-[#654321] shadow-sm'
                            : 'border-stone-200/80 bg-white text-stone-700 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-[#B26A3B] bg-[#B26A3B]' : 'border-stone-300'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>{val.label}</span>
                        </div>
                        {val.price_adjustment > 0 ? (
                          <span className="text-xs font-bold text-[#B26A3B]">
                            +{formatCurrency(val.price_adjustment)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400 font-normal">Tiêu chuẩn</span>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Sugar Option */}
          {sugarOption && sugarOption.values && sugarOption.values.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-[#231709] uppercase tracking-wider">
                  2. Lượng Đường
                </label>
                <span className="text-[11px] text-stone-400 font-medium">Tùy chọn</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {sugarOption.values
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((val) => {
                    const isSelected = selectedSugar === val.label
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => setSelectedSugar(val.label)}
                        className={`py-2 px-1 rounded-xl text-xs font-medium text-center border-2 transition-all truncate ${
                          isSelected
                            ? 'border-[#B26A3B] bg-[#FFF8F0] text-[#654321] font-bold shadow-sm'
                            : 'border-stone-200/80 bg-white text-stone-600 hover:border-amber-300'
                        }`}
                      >
                        {val.label}
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Ice Option */}
          {iceOption && iceOption.values && iceOption.values.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-[#231709] uppercase tracking-wider">
                  3. Lượng Đá
                </label>
                <span className="text-[11px] text-stone-400 font-medium">Tùy chọn</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {iceOption.values
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((val) => {
                    const isSelected = selectedIce === val.label
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => setSelectedIce(val.label)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-medium text-center border-2 transition-all ${
                          isSelected
                            ? 'border-[#B26A3B] bg-[#FFF8F0] text-[#654321] font-bold shadow-sm'
                            : 'border-stone-200/80 bg-white text-stone-600 hover:border-amber-300'
                        }`}
                      >
                        {val.label}
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Toppings Option */}
          {toppingOption && toppingOption.values && toppingOption.values.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-[#231709] uppercase tracking-wider">
                  4. Topping Thêm
                </label>
                <span className="text-[11px] text-stone-400 font-medium">Chọn nhiều</span>
              </div>
              <div className="space-y-2">
                {toppingOption.values
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((val) => {
                    const isSelected = selectedToppings.some((t) => t.name === val.label)
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => handleToppingToggle(val.label, val.price_adjustment)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl text-sm border-2 transition-all ${
                          isSelected
                            ? 'border-[#B26A3B] bg-[#FFF8F0] text-[#654321] font-semibold shadow-sm'
                            : 'border-stone-200/80 bg-white text-stone-700 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'border-[#B26A3B] bg-[#B26A3B] text-white'
                                : 'border-stone-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span>{val.label}</span>
                        </div>
                        <span className="text-xs font-bold text-[#B26A3B]">
                          +{formatCurrency(val.price_adjustment)}
                        </span>
                      </button>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-[#231709] uppercase tracking-wider mb-2 block">
              Ghi chú cho Barista
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Ít ngọt, đánh nhiều bọt, lấy ly mang đi..."
              className="w-full p-3.5 rounded-2xl border-2 border-stone-200/80 bg-white text-xs sm:text-sm focus:outline-none focus:border-[#B26A3B] transition-colors resize-none placeholder:text-stone-400"
              rows={2}
            />
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200 shrink-0 flex items-center gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition-all"
              aria-label="Giảm số lượng"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-base font-bold text-[#231709] w-7 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-stone-700 hover:bg-stone-50 active:scale-95 transition-all"
              aria-label="Tăng số lượng"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <Button
            type="button"
            onClick={handleAddToCart}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#654321] to-[#B26A3B] text-white font-bold text-sm sm:text-base flex items-center justify-between px-5 shadow-lg shadow-amber-950/20 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Thêm vào giỏ
            </span>
            <span className="text-amber-200 font-extrabold">
              {formatCurrency(totalPrice)}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default ProductDetailModal
