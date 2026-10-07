import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast-provider'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Coffee House — Order Cafe Online',
  description: 'Đặt món cafe nhanh chóng ngay tại bàn. Trải nghiệm đặt hàng hiện đại tại Coffee House.',
  openGraph: {
    title: 'Coffee House — Order Cafe Online',
    description: 'Đặt món cafe nhanh chóng ngay tại bàn.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}
