'use client'

import { Coffee } from 'lucide-react'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-4">
      <div className="text-center">
        <Coffee className="h-16 w-16 text-[#C68B59] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#3B2416] mb-2">Có lỗi xảy ra</h1>
        <p className="text-[#6F4E37] mb-6">Vui lòng thử lại sau</p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center bg-[#6F4E37] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#5A3E2B] transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  )
}
