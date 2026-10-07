import { Coffee } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
      <div className="text-center">
        <Coffee className="h-10 w-10 text-[#C68B59] mx-auto animate-pulse" />
        <p className="mt-4 text-sm text-[#6F4E37]">Đang tải...</p>
      </div>
    </div>
  )
}
