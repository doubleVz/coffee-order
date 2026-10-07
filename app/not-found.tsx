import Link from 'next/link'
import { Coffee } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-4">
      <div className="text-center">
        <Coffee className="h-16 w-16 text-[#C68B59] mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-[#3B2416] mb-2">404</h1>
        <p className="text-[#6F4E37] mb-6">Trang bạn tìm không tồn tại</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-[#6F4E37] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#5A3E2B] transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
