'use client'

import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import {
  Coffee,
  Leaf,
  IceCreamCone,
  Cake,
  GlassWater,
  Star,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  QrCode,
  Flame,
} from 'lucide-react'
import { Header } from '@/components/customer/Header'
import { Footer } from '@/components/customer/Footer'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { Product, Category } from '@/types'
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from '@/lib/data/mock-data'

const categoryIcons: Record<string, React.ReactNode> = {
  'ca-phe': <Coffee className="h-6 w-6" />,
  'tra': <Leaf className="h-6 w-6" />,
  'da-xay': <IceCreamCone className="h-6 w-6" />,
  'banh': <Cake className="h-6 w-6" />,
  'nuoc-ep': <GlassWater className="h-6 w-6" />,
}


function FallingPetals() {
  const petals = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${(i * 37) % 101}%`,
    size: 10 + ((i * 7) % 12),
    duration: 9 + ((i * 11) % 10),
    delay: -((i * 13) % 18),
    drift: -70 + ((i * 29) % 141),
    rotate: 180 + ((i * 43) % 361),
    opacity: 0.28 + ((i * 17) % 45) / 100,
  }))

  return (
    <>
      <style jsx global>{`

        .welcome-gate {
          position: fixed;
          inset: 0;
          z-index: 100;
          overflow: hidden;
          background: #231709;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: visibility 0s linear 1.35s;
        }

        .welcome-gate--open {
          visibility: hidden;
        }

        .welcome-door {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50%;
          z-index: 2;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.025), transparent 25%, rgba(0,0,0,0.12)),
            linear-gradient(135deg, #2b1b0d 0%, #4b2d16 48%, #231709 100%);
          box-shadow: inset 0 0 70px rgba(0,0,0,0.28);
          transition:
            transform 1.25s cubic-bezier(0.77, 0, 0.175, 1),
            box-shadow 1.25s ease;
        }

        .welcome-door::before {
          content: "";
          position: absolute;
          top: 7%;
          bottom: 7%;
          width: 72%;
          border: 1px solid rgba(244, 190, 102, 0.18);
          background:
            linear-gradient(rgba(255,255,255,0.025), rgba(0,0,0,0.08)),
            repeating-linear-gradient(
              90deg,
              transparent 0,
              transparent 25px,
              rgba(255,255,255,0.018) 26px,
              transparent 27px
            );
        }

        .welcome-door--left {
          left: 0;
          transform-origin: left center;
        }

        .welcome-door--left::before {
          right: 7%;
          border-radius: 0 22px 22px 0;
        }

        .welcome-door--right {
          right: 0;
          transform-origin: right center;
          background:
            linear-gradient(270deg, rgba(255,255,255,0.025), transparent 25%, rgba(0,0,0,0.12)),
            linear-gradient(225deg, #2b1b0d 0%, #4b2d16 48%, #231709 100%);
        }

        .welcome-door--right::before {
          left: 7%;
          border-radius: 22px 0 0 22px;
        }

        .welcome-gate--open .welcome-door--left {
          transform: translateX(-100%);
          box-shadow: 0 0 0 rgba(0,0,0,0);
        }

        .welcome-gate--open .welcome-door--right {
          transform: translateX(100%);
          box-shadow: 0 0 0 rgba(0,0,0,0);
        }

        .welcome-content {
          position: relative;
          z-index: 4;
          width: min(90vw, 480px);
          text-align: center;
          color: white;
          transition:
            opacity 0.35s ease,
            transform 0.75s cubic-bezier(0.77, 0, 0.175, 1);
        }

        .welcome-gate--open .welcome-content {
          opacity: 0;
          transform: scale(0.92);
          pointer-events: none;
        }

        .welcome-logo {
          width: 64px;
          height: 64px;
          margin: 0 auto 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(245, 193, 103, 0.55);
          border-radius: 20px;
          color: #f5c167;
          background: rgba(255,255,255,0.06);
          box-shadow:
            0 0 0 8px rgba(245,193,103,0.035),
            0 18px 50px rgba(0,0,0,0.28);
          backdrop-filter: blur(8px);
        }

        .welcome-subtitle {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.42em;
          color: #e7bd7b;
          margin-left: 0.42em;
        }

        .welcome-content h2 {
          margin-top: 10px;
          font-size: clamp(36px, 8vw, 64px);
          line-height: 0.95;
          letter-spacing: -0.045em;
          font-weight: 900;
          background: linear-gradient(135deg, #fff9ed, #e6bd7d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .welcome-content p {
          margin-top: 17px;
          color: rgba(255,255,255,0.68);
          font-size: 14px;
        }

        .welcome-button {
          margin: 32px auto 0;
          min-height: 58px;
          padding: 0 26px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          border: 1px solid rgba(255, 214, 145, 0.42);
          border-radius: 18px;
          color: #2b1b0d;
          background: linear-gradient(135deg, #fff7e7, #e8bd7c);
          box-shadow:
            0 16px 45px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.8);
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .welcome-button:hover {
          transform: translateY(-3px) scale(1.025);
          box-shadow:
            0 22px 55px rgba(0,0,0,0.38),
            0 0 0 6px rgba(232,189,124,0.08);
        }

        .welcome-button:active {
          transform: translateY(0) scale(0.985);
        }

        .welcome-hint {
          display: block;
          margin-top: 17px;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }

        @media (max-width: 640px) {
          .welcome-door::before {
            width: 82%;
          }

          .welcome-content h2 {
            font-size: 42px;
          }

          .welcome-button {
            min-height: 54px;
            padding: 0 21px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .welcome-door,
          .welcome-content,
          .welcome-gate {
            transition-duration: 0.01ms !important;
          }
        }

        @keyframes coffeePetalFall {
          0% {
            transform: translate3d(0, -12vh, 0) rotate(0deg);
          }
          25% {
            transform: translate3d(var(--petal-drift), 25vh, 0) rotate(90deg);
          }
          50% {
            transform: translate3d(calc(var(--petal-drift) * -0.45), 50vh, 0) rotate(180deg);
          }
          75% {
            transform: translate3d(calc(var(--petal-drift) * 0.65), 75vh, 0) rotate(270deg);
          }
          100% {
            transform: translate3d(0, 112vh, 0) rotate(var(--petal-rotate));
          }
        }

        .coffee-petal {
          position: fixed;
          top: -40px;
          z-index: 40;
          pointer-events: none;
          width: var(--petal-size);
          height: calc(var(--petal-size) * 0.68);
          border-radius: 100% 0 100% 0;
          background: linear-gradient(
            135deg,
            rgba(255, 214, 224, 0.95),
            rgba(244, 164, 180, 0.82)
          );
          box-shadow:
            0 2px 7px rgba(120, 58, 72, 0.12),
            inset -2px -2px 3px rgba(170, 76, 96, 0.12);
          animation: coffeePetalFall var(--petal-duration) linear var(--petal-delay) infinite;
          will-change: transform;
        }

        .coffee-petal::after {
          content: "";
          position: absolute;
          left: 48%;
          top: 8%;
          width: 1px;
          height: 82%;
          background: rgba(164, 78, 96, 0.18);
          transform: rotate(25deg);
          transform-origin: center;
        }

        @media (prefers-reduced-motion: reduce) {
          .coffee-petal {
            display: none;
          }
        }
      `}</style>

      <div aria-hidden="true" className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
        {petals.map((petal) => (
          <span
            key={petal.id}
            className="coffee-petal"
            style={
              {
                left: petal.left,
                "--petal-size": `${petal.size}px`,
                "--petal-duration": `${petal.duration}s`,
                "--petal-delay": `${petal.delay}s`,
                "--petal-drift": `${petal.drift}px`,
                "--petal-rotate": `${petal.rotate}deg`,
                opacity: petal.opacity,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </>
  )
}


function WelcomeGate({
  open,
  onOpen,
}: {
  open: boolean
  onOpen: () => void
}) {
  return (
    <div
      aria-hidden={open}
      className={`welcome-gate ${open ? 'welcome-gate--open' : ''}`}
    >
      <div className="welcome-door welcome-door--left" />
      <div className="welcome-door welcome-door--right" />

      <div className="welcome-content">
        <div className="welcome-logo">
          <Coffee className="w-7 h-7" />
        </div>

        <div className="welcome-subtitle">WELCOME TO</div>
        <h2>COFFEE HOUSE</h2>
        <p>Một chút cà phê, một chút thảnh thơi.</p>

        <button
          type="button"
          onClick={onOpen}
          className="welcome-button"
          disabled={open}
        >
          <span>Khám phá không gian</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <span className="welcome-hint">Bấm để bước vào</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [phase, setPhase] = useState<'gate' | 'transitioning' | 'content'>(() => {
    // Chỉ hiện WelcomeGate 1 lần duy nhất mỗi phiên truy cập
    if (typeof window !== 'undefined' && sessionStorage.getItem('coffee_gate_opened')) {
      return 'content'
    }
    return 'gate'
  })

  const handleOpen = () => {
    setPhase('transitioning')
    sessionStorage.setItem('coffee_gate_opened', '1')
    // Sau khi animation cửa mở xong (~1.4s), xóa gate khỏi DOM
    setTimeout(() => setPhase('content'), 1400)
  }

  return (
    <>
      <FallingPetals />
      {phase !== 'content' && (
        <WelcomeGate
          open={phase === 'transitioning'}
          onOpen={handleOpen}
        />
      )}
      {phase !== 'gate' && <MainContent />}
    </>
  )
}

function MainContent() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [bestSellers, setBestSellers] = useState<Product[]>(() =>
    MOCK_PRODUCTS.filter((p) => p.is_best_seller).slice(0, 6)
  )

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const [catsRes, prodsRes] = await Promise.allSettled([
          supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('products').select('*, category:categories(*)').eq('is_available', true).eq('is_best_seller', true).order('sort_order').limit(6),
        ])

        if (catsRes.status === 'fulfilled' && catsRes.value.data && catsRes.value.data.length > 0) {
          setCategories(catsRes.value.data as Category[])
        }
        if (prodsRes.status === 'fulfilled' && prodsRes.value.data && prodsRes.value.data.length > 0) {
          setBestSellers(prodsRes.value.data as Product[])
        }
      } catch {
        // Keep initial mock data
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231709] flex flex-col font-sans selection:bg-amber-200">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-24">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-400/15 via-orange-300/10 to-amber-200/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline & CTA */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-xs font-bold mb-6 shadow-xs backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Đang phục vụ tại quán • Mở cửa đến 23:00</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#231709] tracking-tight leading-[1.12]">
                Hương vị cà phê chuẩn gu.
                <br />
                <span className="bg-gradient-to-r from-[#B26A3B] via-amber-600 to-[#654321] bg-clip-text text-transparent">
                  Khoảnh khắc thảnh thơi.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Thưởng thức tách cà phê rang mộc thượng hạng và bánh ngọt nướng tươi. Đặt món nhanh chóng ngay tại bàn qua mã QR chỉ trong 30 giây.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start">
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#654321] to-[#B26A3B] text-white px-8 py-4 rounded-2xl text-base font-bold shadow-lg shadow-amber-950/20 hover:scale-103 active:scale-98 transition-all"
                >
                  <Coffee className="h-5 w-5" />
                  Xem Thực Đơn & Gọi Món
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/#about"
                  className="inline-flex items-center justify-center gap-2 bg-white text-stone-700 border-2 border-stone-200 px-7 py-4 rounded-2xl text-base font-bold hover:border-amber-400 hover:bg-stone-50 transition-all shadow-xs"
                >
                  Khám phá không gian
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 pt-8 border-t border-stone-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-black text-[#654321]">100%</div>
                  <div className="text-xs text-stone-500 font-medium mt-0.5">Cà phê rang mộc</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#B26A3B]">4.9 ★</div>
                  <div className="text-xs text-stone-500 font-medium mt-0.5">Đánh giá khách hàng</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#654321]">&lt; 5p</div>
                  <div className="text-xs text-stone-500 font-medium mt-0.5">Thời gian pha chế</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with Overlays */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-stone-900 group">
                  <img
                    src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=900&auto=format&fit=crop"
                    alt="Artisan Coffee House Barista"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block mb-1">
                      Signature Blend
                    </span>
                    <h3 className="text-lg font-bold">Cà phê sữa đá & Bạc xỉu Sài Gòn</h3>
                    <p className="text-xs text-stone-300 mt-1">Đậm vị, béo thơm chuẩn gu người Việt</p>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-700">
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#231709]">Bán chạy nhất</div>
                    <div className="text-[11px] text-stone-500">Bạc xỉu 3 tầng béo ngậy</div>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-700">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#231709]">Quét QR tại bàn</div>
                    <div className="text-[11px] text-stone-500">Không xếp hàng chờ đợi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 bg-white border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-[#B26A3B] shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#231709]">Hạt Cà Phê Mộc</h4>
                <p className="text-[11px] sm:text-xs text-stone-500">Tuyển chọn từ Cầu Đất</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-[#B26A3B] shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#231709]">Order Tại Bàn</h4>
                <p className="text-[11px] sm:text-xs text-stone-500">Món ra sau 3 - 5 phút</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-[#B26A3B] shrink-0">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#231709]">Bánh Nướng Mỗi Ngày</h4>
                <p className="text-[11px] sm:text-xs text-stone-500">Tiramisu, Croissant Pháp</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-[#B26A3B] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#231709]">Chất Lượng Đảm Bảo</h4>
                <p className="text-[11px] sm:text-xs text-stone-500">Đổi món nếu chưa vừa ý</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      {categories.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700 block mb-1">
                  Đa dạng lựa chọn
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#231709] tracking-tight">
                  Danh mục đồ uống & món ăn
                </h2>
              </div>
              <Link
                href="/menu"
                className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#B26A3B] hover:text-[#654321] transition-colors"
              >
                Xem tất cả {categories.length} danh mục <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/menu?category=${cat.slug}`}
                  className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200/80 coffee-card-shadow coffee-card-hover p-5 flex flex-col items-center text-center transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-[#B26A3B] group-hover:scale-110 group-hover:bg-[#654321] group-hover:text-white transition-all duration-300 shadow-sm mb-4">
                    {categoryIcons[cat.slug] || <Coffee className="h-7 w-7" />}
                  </div>
                  <h3 className="font-bold text-[#231709] text-sm group-hover:text-[#B26A3B] transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="mt-1 text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                  <span className="mt-3 text-[11px] font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Khám phá <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="py-16 sm:py-20 bg-white border-y border-stone-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Được gọi nhiều nhất
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#231709] tracking-tight">
                Món Bán Chạy Nhất Tại Quán
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-stone-500">
                Những ly thức uống đặc trưng chinh phục hàng ngàn thực khách mỗi tuần
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {bestSellers.map((product) => (
                <div
                  key={product.id}
                  className="group bg-[#FAF7F2] rounded-3xl border border-stone-200/80 overflow-hidden coffee-card-shadow coffee-card-hover flex flex-col transition-all"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">☕</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-600 to-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        <Star className="h-3 w-3 fill-current" />
                        Best Seller
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-[#231709] text-base group-hover:text-[#B26A3B] transition-colors">
                        {product.name}
                      </h3>
                      <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 font-medium block">Giá chỉ</span>
                        <span className="text-lg font-black text-[#B26A3B]">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <Link
                        href={`/menu`}
                        className="px-4 py-2 rounded-xl bg-[#654321] text-white text-xs font-bold hover:bg-[#523518] shadow-sm transition-all"
                      >
                        Đặt món ngay
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-[#231709] text-sm font-bold transition-colors"
              >
                Khám phá toàn bộ thực đơn
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-16 sm:py-24" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-lg border-2 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=800&auto=format&fit=crop"
                    alt="Coffee roasting process"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden aspect-square shadow-lg border-2 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop"
                    alt="Cafe interior ambience"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="rounded-3xl overflow-hidden aspect-square shadow-lg border-2 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop"
                    alt="Latte art creation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-lg border-2 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=800&auto=format&fit=crop"
                    alt="Coffee and dessert table"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <Coffee className="w-3.5 h-3.5 text-amber-700" />
                Câu chuyện thương hiệu
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#231709] tracking-tight leading-tight">
                Nơi mỗi tách cà phê là một tác phẩm thủ công
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Coffee House ra đời từ niềm đam mê đem đến trải nghiệm cà phê thuần khiết và không gian làm việc, thư giãn ấm áp.
                Từng mẻ hạt Arabica Cầu Đất và Robusta Buôn Ma Thuột được rang ở nhiệt độ chuẩn xác để giữ trọn vẹn hương hoa cỏ tự nhiên và hậu vị ngọt sâu.
              </p>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Hệ thống đặt món thông minh giúp bạn chọn size, gia giảm lượng đường đá ưa thích ngay tại bàn mà không phải xếp hàng chờ đợi.
              </p>

              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-stone-200">
                <div>
                  <div className="text-3xl font-black text-[#B26A3B]">5+</div>
                  <div className="text-xs text-stone-500 font-medium mt-1">Năm hình thành</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#654321]">25+</div>
                  <div className="text-xs text-stone-500 font-medium mt-1">Món đồ uống & bánh</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#B26A3B]">10k+</div>
                  <div className="text-xs text-stone-500 font-medium mt-1">Khách hàng yêu thích</div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#654321] text-white text-sm font-bold hover:bg-[#523518] shadow-md transition-all"
                >
                  Ghé thăm thực đơn ngay <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

