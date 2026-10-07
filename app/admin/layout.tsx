'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Coffee,
  FolderOpen,
  TableProperties,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const sidebarItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ClipboardList },
  { href: '/admin/products', label: 'Sản phẩm', icon: Coffee },
  { href: '/admin/categories', label: 'Danh mục', icon: FolderOpen },
  { href: '/admin/tables', label: 'Bàn', icon: TableProperties },
  { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b px-4 h-14">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-bold text-[#3B2416] flex items-center gap-2">
          <Coffee className="h-5 w-5 text-[#C68B59]" />
          Admin
        </span>
        <div className="w-9" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-[#3B2416] flex items-center gap-2">
                <Coffee className="h-5 w-5 text-[#C68B59]" />
                COFFEE HOUSE
              </span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-gray-100" aria-label="Đóng">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#6F4E37] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r">
          <div className="flex items-center h-16 px-6 border-b">
            <Coffee className="h-6 w-6 text-[#C68B59] mr-2" />
            <span className="font-bold text-[#3B2416] text-lg">COFFEE HOUSE</span>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#6F4E37] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>
          <div className="p-3 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
