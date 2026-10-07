'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Coffee, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error('Email hoặc mật khẩu không đúng')
        return
      }

      toast.success('Đăng nhập thành công')
      router.push('/admin')
      router.refresh()
    } catch {
      toast.error('Đã xảy ra lỗi')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-[#F8F3EA] rounded-2xl flex items-center justify-center mb-4">
            <Coffee className="h-8 w-8 text-[#6F4E37]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3B2416]">Quản trị</h1>
          <p className="text-sm text-gray-500 mt-1">Đăng nhập để quản lý quán</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@coffeehouse.vn"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Đang đăng nhập...</>
            ) : (
              'Đăng nhập'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
