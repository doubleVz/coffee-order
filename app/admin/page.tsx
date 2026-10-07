'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, DollarSign, Clock, CheckCircle, TrendingUp, Coffee } from 'lucide-react'
import type { DashboardStats } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[#3B2416] mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <Coffee className="h-12 w-12 text-gray-300 mx-auto" />
        <p className="mt-4 text-gray-500">Không thể tải dữ liệu</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Đơn hôm nay',
      value: stats.totalOrdersToday.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(stats.revenueToday),
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Đang chờ',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: 'Hoàn thành',
      value: stats.completedOrders.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#3B2416] mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#3B2416] mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#C68B59]" />
              Doanh thu 7 ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => {
                      const d = new Date(val)
                      return `${d.getDate()}/${d.getMonth() + 1}`
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: unknown) => [formatCurrency(Number(value || 0)), 'Doanh thu']}
                    labelFormatter={(label: unknown) => {
                      const d = new Date(String(label))
                      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
                    }}
                  />
                  <Bar dataKey="revenue" fill="#C68B59" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-[#C68B59]" />
              Top 5 món bán chạy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-4">
                {stats.topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#C68B59] w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3B2416] truncate">{p.name}</p>
                    </div>
                    <span className="text-sm text-gray-500">{p.count} ly</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
