# ☕ COFFEE HOUSE — Hệ thống Order Quán Cafe

Website cho phép khách hàng quét QR Code tại bàn → xem menu → chọn món → tùy chỉnh → đặt hàng.
Nhân viên quán có trang quản trị riêng để quản lý đơn hàng, sản phẩm, danh mục và bàn.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js App Router, API Routes
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Realtime**: Supabase Realtime
- **QR Code**: qrcode.react
- **Charts**: Recharts
- **State**: Zustand (cart persistence)
- **Deployment**: Vercel

## 📋 Requirements

- Node.js 18+
- npm 9+
- Supabase account (free tier works)
- Vercel account (for deployment)

## 🚀 Installation

### 1. Clone và cài dependencies

```bash
git clone <repo-url>
cd coffee-order
npm install
```

### 2. Tạo Supabase Project

1. Truy cập [supabase.com](https://supabase.com) và tạo project mới
2. Lưu lại **Project URL**, **anon key** và **service_role key**

### 3. Cấu hình Environment Variables

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Chạy Database Migration

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Copy nội dung file `supabase/migrations/001_initial_schema.sql` và chạy
3. Copy nội dung file `supabase/seed.sql` và chạy

### 5. Enable Realtime

Trong Supabase Dashboard:
1. Vào **Database** → **Replication**
2. Bật Realtime cho bảng `orders`

### 6. Tạo Admin Account

Trong Supabase Dashboard:
1. Vào **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Nhập email và password
4. Sử dụng thông tin này để đăng nhập tại `/admin/login`

### 7. Chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
coffee-order/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── error.tsx             # Error boundary
│   ├── loading.tsx           # Loading state
│   ├── not-found.tsx         # 404 page
│   ├── menu/                 # Menu page
│   ├── cart/                 # Cart page
│   ├── checkout/             # Checkout page
│   ├── order-success/        # Order success
│   ├── order/[id]/           # Order tracking
│   ├── api/
│   │   ├── orders/           # Order API (create, list, update)
│   │   └── admin/            # Admin APIs
│   └── admin/
│       ├── layout.tsx        # Admin sidebar layout
│       ├── login/            # Admin login
│       ├── page.tsx          # Dashboard
│       ├── orders/           # Order management
│       ├── products/         # Product CRUD
│       ├── categories/       # Category CRUD
│       ├── tables/           # Table & QR management
│       └── settings/         # Settings
├── components/
│   ├── customer/             # Customer-facing components
│   └── ui/                   # Reusable UI components
├── lib/
│   ├── supabase/             # Supabase clients
│   ├── store/                # Zustand cart store
│   ├── utils.ts              # Utilities
│   └── validations.ts        # Zod schemas
├── types/                    # TypeScript types
└── supabase/
    ├── migrations/           # SQL migrations
    └── seed.sql              # Seed data
```

## 🔐 Database Schema

| Table | Mô tả |
|-------|--------|
| `categories` | Danh mục sản phẩm (Cà phê, Trà, Đá xay...) |
| `products` | Sản phẩm (tên, giá, mô tả, trạng thái) |
| `product_options` | Tùy chọn sản phẩm (Size, Đường, Đá, Topping) |
| `product_option_values` | Giá trị tùy chọn (M, L, 50%, 100%...) |
| `tables` | Bàn (tên, mã, sức chứa, trạng thái) |
| `orders` | Đơn hàng (mã đơn, khách hàng, trạng thái) |
| `order_items` | Chi tiết đơn hàng (sản phẩm, số lượng, giá) |

## 🔄 Order Flow

```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
                                          ↗ CANCELLED (bất kỳ bước nào)
```

## 📱 QR Code Flow

1. Admin tạo bàn tại `/admin/tables`
2. Click "QR Code" để xem và in QR
3. QR link: `/menu?table={table_id}`
4. Khách scan → website tự nhận biết bàn → hiển thị tên bàn
5. Khi checkout, `table_id` tự động được gắn vào đơn hàng

## 🔒 Security

- Row Level Security (RLS) trên tất cả bảng
- `SUPABASE_SERVICE_ROLE_KEY` chỉ sử dụng server-side
- Giá sản phẩm được tính server-side, không tin giá từ client
- Admin routes được bảo vệ bởi middleware
- Input validation với Zod

## 🌐 Deploy to Vercel

### 1. Push code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <github-repo-url>
git push -u origin main
```

### 2. Deploy trên Vercel

1. Truy cập [vercel.com](https://vercel.com) → Import project từ GitHub
2. Cấu hình Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL Vercel sau khi deploy)
3. Click **Deploy**

### 3. Cập nhật Supabase

Sau khi deploy, cập nhật:
- Supabase → Authentication → URL Configuration → Site URL = URL Vercel
- Supabase → Authentication → URL Configuration → Redirect URLs += URL Vercel

## 📦 Scripts

```bash
npm run dev       # Chạy development server
npm run build     # Build production
npm run start     # Start production server
npm run lint      # Chạy ESLint
```

## 🎨 Theme Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Dark Coffee | `#3B2416` | Text chính, headings |
| Cream | `#F8F3EA` | Background phụ |
| Brown | `#6F4E37` | Buttons, links |
| Accent | `#C68B59` | Highlights, prices |
| Background | `#FFFDF8` | Background chính |
| Text | `#2B2118` | Body text |

## ✅ Features

- [x] Landing page premium
- [x] Menu với tìm kiếm và filter
- [x] Product detail modal (size, đường, đá, topping)
- [x] Giỏ hàng (localStorage persistence)
- [x] Checkout với validation
- [x] QR Code theo bàn
- [x] Order tracking realtime
- [x] Admin dashboard với charts
- [x] Admin order management (realtime)
- [x] Admin product CRUD
- [x] Admin category CRUD
- [x] Admin table & QR management
- [x] Supabase Auth
- [x] Row Level Security
- [x] Server-side price validation
- [x] Responsive mobile-first
- [x] Vietnamese localization
- [x] Toast notifications
- [x] Error boundaries

## 🔮 Roadmap (Post-MVP)

- [ ] Thanh toán online (VNPay, MoMo)
- [ ] Upload ảnh sản phẩm (Supabase Storage)
- [ ] Push notifications
- [ ] Voucher / Khuyến mãi
- [ ] Multi-branch
- [ ] Loyalty program
- [ ] Quản lý nhân viên
- [ ] Máy in hóa đơn
- [ ] Analytics nâng cao

## 📄 License

MIT
