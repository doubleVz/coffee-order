import { Coffee, MapPin, Phone, Clock, ArrowUpRight, Heart } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#231709] text-stone-300 border-t border-amber-950/40 relative overflow-hidden" id="contact">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-800/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B26A3B] to-amber-500 flex items-center justify-center text-white shadow-md">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">COFFEE HOUSE</span>
                <span className="block text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                  Không gian & Cà phê thủ công
                </span>
              </div>
            </div>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-md">
              Mỗi giọt cà phê tại Coffee House được chắt lọc từ những hạt cà phê tuyển chọn từ cao nguyên Cầu Đất & Buôn Ma Thuột. Trải nghiệm order nhanh tại bàn, không cần đợi chờ.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                ☕ Wifi tốc độ cao 500Mbps
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                ⚡ Ổ cắm điện mọi bàn
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Địa chỉ & Hotline
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5 text-stone-300">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-amber-400" />
                <span>123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2.5 text-stone-300">
                <Phone className="h-4 w-4 shrink-0 text-amber-400" />
                <a href="tel:0901234567" className="hover:text-white transition-colors">
                  0901 234 567
                </a>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Giờ phục vụ
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-center gap-2.5 text-stone-300">
                <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Thứ 2 - Thứ 6: 07:00 - 22:30</span>
              </li>
              <li className="flex items-center gap-2.5 text-stone-300">
                <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                <span>Thứ 7 - CN: 07:00 - 23:00</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white transition-colors"
              >
                Khám phá thực đơn <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Coffee House Roastery. All rights reserved.</p>
          <p className="flex items-center gap-1 text-stone-400">
            Pha chế với <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> tại Sài Gòn
          </p>
        </div>
      </div>
    </footer>
  )
}
export default Footer
