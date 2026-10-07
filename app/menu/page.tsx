import { Suspense } from 'react'
import { Header } from '@/components/customer/Header'
import { Footer } from '@/components/customer/Footer'
import { MenuContent } from '@/components/customer/MenuContent'
import { CartFloatingButton } from '@/components/customer/CartFloatingButton'
import { Coffee } from 'lucide-react'

export const metadata = {
  title: 'Thực đơn đồ uống & Bánh ngọt — Coffee House',
  description: 'Khám phá hơn 25 món cà phê thủ công, trà trái cây và bánh nướng tươi tại Coffee House',
}

function MenuLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-amber-200 border-t-amber-700 animate-spin" />
        <Coffee className="w-7 h-7 text-amber-800 absolute inset-0 m-auto" />
      </div>
      <p className="mt-5 text-sm font-semibold text-[#654321] tracking-wide animate-pulse">
        Đang tải danh sách đồ uống...
      </p>
    </div>
  )
}

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231709] flex flex-col font-sans">
      <Header />
      <div className="flex-1">
        <Suspense fallback={<MenuLoading />}>
          <MenuContent />
        </Suspense>
      </div>
      <CartFloatingButton />
      <Footer />
    </div>
  )
}
