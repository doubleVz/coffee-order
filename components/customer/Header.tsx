'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ShoppingCart, Coffee, MapPin, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { formatCurrency } from '@/lib/utils'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const itemCount = useCartStore((state) => state.getItemCount())
  const total = useCartStore((state) => state.getTotal())
  const tableName = useCartStore((state) => state.tableName)

  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Thực đơn', href: '/menu' },
    { name: 'Về chúng tôi', href: '/#about' },
    { name: 'Liên hệ', href: '/#contact' },
  ]

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-amber-950/10 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#654321] to-[#B26A3B] flex items-center justify-center text-white shadow-md group-hover:scale-105 group-hover:shadow-amber-900/30 transition-all duration-300">
              <Coffee className="h-6 w-6 text-amber-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-[#231709] tracking-tight group-hover:text-[#B26A3B] transition-colors leading-none">
                COFFEE HOUSE
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-800 mt-1">
                Artisan Roasters
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/70 p-1.5 rounded-full border border-stone-200/60 backdrop-blur-xs">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-[#654321] shadow-xs'
                      : 'text-stone-600 hover:text-[#231709] hover:bg-white/50'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Actions: Table Badge & Cart & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Table badge if seated */}
            {tableName && (
              <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-900">
                <MapPin className="h-3.5 w-3.5 text-amber-700" />
                <span>{tableName}</span>
              </div>
            )}

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-[#FFFDF8] border border-amber-950/15 hover:border-amber-700 text-[#231709] shadow-xs hover:shadow-md transition-all active:scale-95"
              aria-label="Giỏ hàng"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-[#654321]" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-amber-600 text-white text-[10px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center shadow-sm animate-pulse">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-[#654321]">
                {itemCount > 0 ? formatCurrency(total) : 'Giỏ hàng'}
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-950/10 space-y-2 animate-in fade-in slide-in-from-top duration-200">
            {tableName && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl text-xs font-semibold text-amber-900 mb-2">
                <MapPin className="h-4 w-4 text-amber-700" />
                <span>Bạn đang đặt hàng tại: <strong>{tableName}</strong></span>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center justify-between px-4 py-3 text-sm font-bold text-stone-700 hover:bg-amber-50 hover:text-amber-900 rounded-2xl transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{link.name}</span>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>
            ))}

            <div className="pt-3 border-t border-stone-200 flex gap-2">
              <Link
                href="/menu"
                onClick={() => setIsMenuOpen(false)}
                className="flex-1 py-3 text-center bg-[#654321] text-white rounded-2xl text-xs font-bold shadow-md"
              >
                Đặt món ngay ⚡
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
export default Header
