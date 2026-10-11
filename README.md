# ☕ COFFEE HOUSE — Hệ thống Đặt món Quán Cafe Thông Minh (QR Order & Table Management)

Website hỗ trợ khách hàng quét mã **QR Code tại bàn** hoặc truy cập trực tiếp → xem thực đơn trực quan → tùy chỉnh topping, đường, đá → kiểm tra tình trạng chỗ ngồi tại bàn → thanh toán tiện lợi (Tiền mặt / VietQR) → theo dõi tiến độ pha chế thời gian thực.  
Đồng thời cung cấp trang **Quản trị (Admin)** cho chủ quán và barista để quản lý đơn hàng, danh mục, sản phẩm và in mã QR bàn.

Dự án hỗ trợ **chạy 2 chế độ linh hoạt**:
1. **Chế độ Tĩnh / Demo (Static Export & GitHub Pages)**: Tích hợp sẵn Mock Data & Zustand local persistence, hoạt động hoàn hảo mà không bắt buộc có database backend.
2. **Chế độ Full-stack (Supabase + Vercel / Node.js Server)**: Kết nối cơ sở dữ liệu PostgreSQL, Realtime WebSocket và xác thực người dùng.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Ghi chú |
|------------|----------------------|---------|
| **Core Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) | Hỗ trợ cả Static Export (`output: 'export'`) và Server-side |
| **Giao diện & UI** | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/) | Theme màu cà phê cổ điển, Glassmorphism, Responsive Mobile-first |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) | Dialog, Alert Dialog, Tabs, Switch, Dropdown, Icon pack |
| **Quản lý State** | [Zustand 5](https://github.com/pmndrs/zustand) | Quản lý Giỏ hàng (`cart-store`) & Trạng thái bàn (`table-store`) với `localStorage` |
| **Cơ sở dữ liệu** | [Supabase](https://supabase.com/) (PostgreSQL + RLS) | Database Cloud, Row-Level Security, SQL migrations |
| **Realtime** | Supabase Realtime Channels | Cập nhật đơn hàng thời gian thực qua WebSocket |
| **Xác thực (Auth)** | Supabase Auth (Email / Password) | Bảo vệ trang quản trị Admin |
| **Mã QR & Thanh toán** | [qrcode.react](https://www.npmjs.com/package/qrcode.react), VietQR API | Sinh mã QR bàn và mã QR thanh toán ngân hàng tự động |
| **Biểu đồ thống kê** | [Recharts](https://recharts.org/) | Thống kê doanh thu & đơn hàng trên Dashboard |
| **Validation** | [Zod 4](https://zod.dev/) | Kiểm tra dữ liệu đầu vào đơn hàng và sản phẩm |
| **Thông báo** | [react-hot-toast](https://react-hot-toast.com/) | Toast thông báo đẹp mắt, mượt mà |
| **CI/CD Deployment** | [GitHub Actions](https://github.com/features/actions) | Tự động build và deploy lên **GitHub Pages** (`deploy.yml`) |

---

## 🌟 Tính Năng Nổi Bật

### 1. Trải nghiệm Khách hàng (Customer Experience)
- **Cửa chào Welcome Gate & Hiệu ứng cánh hoa rơi (Falling Petals)**: Mở ra không gian quán ấm áp, tinh tế ngay khi truy cập trang chủ.
- **Thực đơn trực quan (`/menu`)**:
  - Tìm kiếm món theo tên, mô tả.
  - Lọc theo danh mục (Cà phê, Trà trái cây, Đá xay, Bánh ngọt, Nước ép).
  - Sắp xếp theo giá (tăng/giảm) và mức độ bán chạy (Best Seller).
  - Modal tùy chỉnh món: chọn **Size** (M/L), **Đường** (0% - 100%), **Đá** (0% - 100% / Uống nóng), các loại **Topping** (Trân châu, Thạch cà phê, Kem cheese, Extra shot), kèm ghi chú riêng cho Barista.
- **Kiểm tra chỗ ngồi & Sơ đồ bàn thời gian thực (`/check-ban`)**:
  - Bảng thống kê trực quan: Tổng số ghế, số chỗ đã lấp đầy, số chỗ còn trống, tỷ lệ phục vụ.
  - Sơ đồ trực quan từng chiếc ghế (Icon ghế có màu theo trạng thái).
  - Bộ lọc bàn theo khu vực (*Tầng trệt, Ban công, Lầu 1, Sân vườn*) và trạng thái (*Trống hoàn toàn, Đang có khách, Đã kín chỗ*).
  - Tích hợp công cụ tăng/giảm số khách rời/vào bàn (+/- Khách) và nút Reset bàn dọn dẹp.
  - Nút *"Chọn bàn này & Gọi món"* chuyển thẳng vào thực đơn có gắn mã bàn.
- **Giỏ hàng tiện lợi (`/cart`)**: Lưu trữ trong `localStorage`, hỗ trợ thay đổi số lượng, xóa món, hiển thị chi tiết options.
- **Thanh toán thông minh (`/checkout`)**:
  - **Kiểm tra sức chứa bàn**: Hệ thống tự động phát hiện và **chặn tuyệt đối việc chọn bàn đã kín chỗ**.
  - **Giới hạn số khách**: Số lượng khách không thể vượt quá số ghế còn lại của bàn đã chọn.
  - **Tích hợp thanh toán**:
    - **Tiền mặt**: Thanh toán tại quầy khi nhận đồ.
    - **Chuyển khoản VietQR**: Tự động sinh mã VietQR chuẩn ngân hàng (MB Bank) kèm số tài khoản, số tiền và cú pháp chuyển khoản chính xác; hỗ trợ nút sao chép nhanh 1 chạm.
  - **Khóa an toàn - Nhân viên xác nhận (Staff PIN Confirmation)**: Đơn hàng chỉ được gửi đến Barista sau khi nhân viên quán nhập mã PIN (`1234` hoặc `8888`) xác nhận đã nhận tiền thành công.
- **Theo dõi tiến độ đơn hàng thời gian thực (`/order` & `/order/[id]`)**:
  - Các bước tiến trình: `PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`.
  - Kết nối Supabase Realtime tự động cập nhật khi trạng thái đơn thay đổi mà không cần reload trang.

### 2. Trang Quản trị Quán (Admin Portal)
- **Đăng nhập an toàn (`/admin/login`)**: Xác thực qua Supabase Auth.
- **Dashboard tổng quan (`/admin`)**: Thống kê số đơn trong ngày, doanh thu, đơn đang chờ, đơn hoàn thành và biểu đồ doanh thu theo thời gian thực với Recharts.
- **Quản lý đơn hàng (`/admin/orders`)**: 
  - Xem danh sách đơn, lọc theo trạng thái (`PENDING`, `PREPARING`, `READY`...).
  - Cập nhật trạng thái chế biến cho Barista.
  - Tự động nhận diện đơn mới qua Realtime WebSocket kèm âm thanh thông báo.
- **Quản lý sản phẩm (`/admin/products`)**: Thêm mới, chỉnh sửa giá, mô tả, hình ảnh, đánh dấu Best Seller / Hết hàng.
- **Quản lý danh mục (`/admin/categories`)**: Tạo mới, đổi tên, thay đổi thứ tự hiển thị.
- **Quản lý bàn & In mã QR (`/admin/tables`)**:
  - Quản lý danh sách bàn, sức chứa ghế, khu vực.
  - Sinh mã QR cho từng bàn (`/menu?table={id}`) kèm hộp thoại xem và in ấn trực tiếp (Print QR Standee) để dán tại bàn.

---

## 📁 Cấu Trúc Thư Mục Dự Án (Project Structure)

```
coffee-order/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions tự động build & deploy GitHub Pages
├── app/                            # Next.js App Router (Client & Server Components)
│   ├── favicon.ico
│   ├── globals.css                 # CSS styles & biến Tailwind v4
│   ├── layout.tsx                  # Root layout (Font Inter, Metadata, ToastProvider)
│   ├── page.tsx                    # Trang chủ (Welcome Gate, Falling Petals, Hero, Best Seller)
│   ├── error.tsx                   # Error Boundary xử lý ngoại lệ
│   ├── loading.tsx                 # Loading fallback toàn trang
│   ├── not-found.tsx               # Trang 404 tùy chỉnh
│   ├── menu/
│   │   └── page.tsx                # Trang thực đơn đồ uống & bánh
│   ├── cart/
│   │   └── page.tsx                # Trang giỏ hàng của khách
│   ├── checkout/
│   │   └── page.tsx                # Trang thanh toán (VietQR, xác nhận PIN nhân viên, kiểm tra chỗ)
│   ├── check-ban/
│   │   └── page.tsx                # Trang sơ đồ bàn, tỷ lệ lấp đầy ghế & quản lý chỗ ngồi
│   ├── order-success/
│   │   └── page.tsx                # Trang thông báo đặt món & thanh toán thành công
│   ├── order/
│   │   ├── page.tsx                # Theo dõi đơn qua Query Param (/order?id=xxx - tối ưu static export)
│   │   └── [id]/
│   │       ├── page.tsx            # Dynamic route theo dõi đơn hàng
│   │       └── OrderTrackingClient.tsx # Component realtime tracking tiến độ pha chế
│   └── admin/                      # Cụm trang quản trị quán cafe
│       ├── layout.tsx              # Sidebar Admin Layout & Mobile Drawer
│       ├── page.tsx                # Admin Dashboard (KPI Cards & Biểu đồ doanh thu Recharts)
│       ├── login/
│       │   └── page.tsx            # Đăng nhập tài khoản quản trị
│       ├── orders/
│       │   └── page.tsx            # Bảng điều phối đơn hàng & Realtime Barista
│       ├── products/
│       │   └── page.tsx            # Quản lý CRUD món ăn & đồ uống
│       ├── categories/
│       │   └── page.tsx            # Quản lý CRUD danh mục sản phẩm
│       ├── tables/
│       │   └── page.tsx            # Quản lý bàn ăn & sinh mã QR in ấn
│       └── settings/
│           └── page.tsx            # Cài đặt hệ thống
├── app_api_disabled/               # Các API Route Handlers (Tạm disable để tương thích Static Export)
│   ├── orders/                     # API tạo & lấy danh sách đơn hàng
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── admin/                      # API Dashboard, Sản phẩm, Bàn, Danh mục
│       ├── dashboard/route.ts
│       ├── products/route.ts
│       ├── categories/route.ts
│       └── tables/route.ts
├── components/
│   ├── customer/                   # Các component phục vụ khách hàng
│   │   ├── Header.tsx              # Thanh điều hướng trên cùng (Logo, NavLinks, Cart Badge)
│   │   ├── Footer.tsx              # Chân trang (Thông tin quán, Địa chỉ, Hotline, Giờ mở cửa)
│   │   ├── MenuContent.tsx         # Nội dung menu, tìm kiếm, lọc danh mục, sắp xếp
│   │   ├── ProductCard.tsx         # Thẻ hiển thị sản phẩm
│   │   ├── ProductDetailModal.tsx  # Modal chọn Size, Đường, Đá, Topping, Số lượng
│   │   ├── TableBanner.tsx         # Banner nhắc vị trí bàn đang ngồi
│   │   └── CartFloatingButton.tsx  # Nút giỏ hàng nổi góc màn hình
│   └── ui/                         # Các UI primitives tái sử dụng (Radix UI + CVA)
│       ├── alert-dialog.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── skeleton.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── toast-provider.tsx
├── lib/
│   ├── data/
│   │   └── mock-data.ts            # Dữ liệu mẫu (15 món, 5 danh mục, 12 bàn ở 4 khu vực, options đồ uống)
│   ├── store/
│   │   ├── cart-store.ts           # Zustand Store quản lý giỏ hàng & bàn đang chọn
│   │   └── table-store.ts          # Zustand Store quản lý trạng thái số chỗ bàn & khách ngồi
│   ├── supabase/
│   │   ├── client.ts               # Browser client kết nối Supabase
│   │   ├── server.ts               # Server client kết nối Supabase (SSR/Service Role)
│   │   └── middleware.ts           # Quản lý phiên đăng nhập auth
│   ├── utils.ts                    # Tiện ích định dạng tiền tệ (VND), ngày giờ, nhãn trạng thái
│   └── validations.ts              # Zod schemas xác thực dữ liệu giỏ hàng, đơn hàng, bàn
├── public/                         # Tài nguyên tĩnh (.nojekyll, hình ảnh, icon SVG)
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # SQL khởi tạo bảng, quan hệ, sequence và RLS Policies
│   └── seed.sql                    # SQL nạp dữ liệu mẫu ban đầu
├── types/
│   └── index.ts                    # Toàn bộ TypeScript Type / Interface của hệ thống
├── middleware.ts.bak               # Middleware Supabase Auth (Đổi đuôi .bak khi dùng Static Export)
├── next.config.ts                  # Cấu hình Next.js (output: 'export', basePath cho GitHub Pages)
├── package.json                    # Khai báo dependencies & scripts
├── tsconfig.json                   # Cấu hình TypeScript
└── README.md                       # Tài liệu hướng dẫn dự án
```

---

## 🔄 Luồng Hoạt Động Cốt Lõi (Core Workflows)

### 1. Luồng Gọi Món & Quét QR Code Tại Bàn
```
[Khách quét QR tại bàn] ──> URL: /menu?table=t1
       │
       ▼
[Nhận diện bàn tự động] ──> Kiểm tra số chỗ còn trống
       │
       ▼
[Chọn món & Tùy chỉnh]  ──> Chọn Size, Đường, Đá, Topping ──> Thêm vào Giỏ hàng
       │
       ▼
[Kiểm tra lại tại Giỏ]  ──> /cart ──> Xác nhận số lượng
       │
       ▼
[Trang Thanh Toán]      ──> /checkout
       ├─► Kiểm tra số lượng khách với số ghế trống còn lại của bàn
       ├─► Chọn hình thức: Tiền mặt hoặc Chuyển khoản VietQR
       └─► Nhân viên thu ngân nhập PIN (1234 / 8888) xác nhận đã thanh toán
       │
       ▼
[Gửi đơn tới Barista]   ──> Tạo mã đơn CFxxxxxx ──> Chuyển hướng tới /order-success
       │
       ▼
[Theo dõi tiến độ]      ──> /order?id=xxx (Realtime cập nhật: Pha chế ➔ Sẵn sàng ➔ Hoàn thành)
```

### 2. Vòng Đời Trạng Thái Đơn Hàng (Order Lifecycle)
```
  [PENDING]      ── Nhân viên tiếp nhận đơn
     │
     ▼
 [CONFIRMED]     ── Xác nhận đơn hợp lệ
     │
     ▼
 [PREPARING]     ── Barista đang thực hiện pha chế đồ uống
     │
     ▼
   [READY]       ── Món đã hoàn tất, mang ra bàn hoặc gọi khách
     │
     ▼
 [COMPLETED]     ── Đơn hàng hoàn tất
     │
 (Hoặc [CANCELLED] ở bất kỳ bước nào nếu phát sinh sự cố)
```

### 3. Vòng Đời Trạng Thái Bàn & Chỗ Ngồi (Table Capacity Lifecycle)
- **`AVAILABLE` (Bàn trống hoàn toàn)**: Số chỗ ngồi bị chiếm = `0`. Sẵn sàng đón khách mới.
- **`PARTIAL` (Đang có khách ngồi)**: `0 < Số chỗ đã ngồi < Sức chứa tối đa của bàn`. Khách khác vẫn có thể ghép bàn nếu số lượng phù hợp.
- **`OCCUPIED` (Đã kín 100% chỗ)**: `Số chỗ đã ngồi >= Sức chứa của bàn`. Hệ thống **chặn hoàn toàn** việc chọn bàn này khi checkout.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18.18 trở lên (khuyên dùng Node 20+).
- **npm**: Phiên bản 9+.

### 2. Cài đặt mã nguồn

```bash
# 1. Clone repository
git clone <URL_REPOSITORY_CỦA_BẠN>
cd coffee-order

# 2. Cài đặt các thư viện phụ thuộc
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
# URL & API Key của Supabase (nếu kết nối database thật)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Base URL ứng dụng
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Base Path (chỉ dùng khi deploy GitHub Pages sub-path, chạy local để trống)
NEXT_PUBLIC_BASE_PATH=
```

> **Ghi chú**: Nếu bạn chỉ muốn chạy thử giao diện hoặc demo static, hệ thống sẽ **tự động fallback về Mock Data** mà không gây lỗi dù không điền key Supabase.

### 4. Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt và truy cập:
- Khách hàng: [http://localhost:3000](http://localhost:3000)
- Thực đơn: [http://localhost:3000/menu](http://localhost:3000/menu)
- Check bàn: [http://localhost:3000/check-ban](http://localhost:3000/check-ban)
- Quản trị viên: [http://localhost:3000/admin](http://localhost:3000/admin) (Đăng nhập: `/admin/login`)

---

## 🗄️ Cấu Hình Supabase (Database & Realtime)

Nếu bạn muốn kích hoạt cơ sở dữ liệu Supabase thực tế:

### 1. Khởi tạo Database Schema
1. Mở [Supabase Dashboard](https://supabase.com/dashboard) ➔ Chọn project của bạn.
2. Vào mục **SQL Editor**.
3. Mở file [001_initial_schema.sql](file:///d:/my%20project/coffee-order/supabase/migrations/001_initial_schema.sql), sao chép toàn bộ nội dung và bấm **Run**.
4. Mở file [seed.sql](file:///d:/my%20project/coffee-order/supabase/seed.sql), sao chép và bấm **Run** để nạp dữ liệu mẫu ban đầu.

### 2. Kích hoạt Realtime Replication
1. Trong Supabase Dashboard, điều hướng đến **Database** ➔ **Replication**.
2. Tìm bảng `orders` và bật công tắc **Source** (Enable Realtime).
3. Đảm bảo bảng `orders` đã nằm trong danh sách replication tables để hỗ trợ WebSocket nhận đơn tự động.

### 3. Tạo tài khoản Quản trị viên (Admin User)
1. Trong Supabase Dashboard, vào mục **Authentication** ➔ **Users**.
2. Bấm **Add user** ➔ **Create user**.
3. Điền email và mật khẩu của quản lý quán.
4. Đăng nhập tại [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

---

## 🌐 Triển Khai (Deployment)

Dự án hỗ trợ 2 phương án triển khai tùy thuộc vào nhu cầu:

### Phương án A: Triển khai Static Export lên GitHub Pages (Mặc định hiện tại)
Dự án đã được cấu hình sẵn cho GitHub Pages thông qua tệp `.github/workflows/deploy.yml` và `next.config.ts`:
1. Push toàn bộ mã nguồn lên nhánh `main` hoặc `master` của repository GitHub.
2. Truy cập **Settings** của repository trên GitHub ➔ **Pages**.
3. Tại phần **Build and deployment** ➔ **Source**, chọn **GitHub Actions**.
4. Workflow sẽ tự động build và xuất tệp tĩnh vào thư mục `out/` và publish trang web.

### Phương án B: Triển khai Full-stack lên Vercel / Docker / Node Server
Nếu bạn muốn sử dụng Route Handlers trong `app/api` và middleware xác thực:
1. Đổi tên thư mục `app_api_disabled/` trở lại thành `app/api/`.
2. Đổi tên `middleware.ts.bak` trở lại thành `middleware.ts`.
3. Trong `next.config.ts`, bỏ dòng `output: 'export'` (hoặc chuyển thành chế độ mặc định).
4. Đẩy mã nguồn lên GitHub và kết nối với Vercel:
   - Cài đặt các biến môi trường: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - Bấm **Deploy**.

---

## 📦 Danh Sách Lệnh (NPM Scripts)

| Lệnh | Công dụng |
|------|-----------|
| `npm run dev` | Chạy máy chủ phát triển (Turbopack / Next dev) |
| `npm run build` | Build dự án sản xuất (xuất thư mục `out/` nếu là static export) |
| `npm run start` | Chạy production server sau khi build |
| `npm run lint` | Kiểm tra cú pháp và quy chuẩn mã nguồn với ESLint |

---

## 🎨 Bảng Màu Chủ Đạo (Theme Palette)

Hệ màu được lấy cảm hứng từ không gian cafe ấm cúng, kết hợp phong cách hiện đại:

| Màu sắc | Mã Hex | Ứng dụng |
|---------|--------|----------|
| **Espresso Dark** | `#231709` | Nền thanh điều hướng, footer, text tiêu đề chính |
| **Warm Coffee** | `#654321` | Nút bấm chính (CTA buttons), icon nổi bật |
| **Amber Caramel** | `#B26A3B` | Giá tiền, huy hiệu Best Seller, điểm nhấn thị giác |
| **Warm Sand / Cream** | `#FAF7F2` | Nền chính của toàn bộ trang web |
| **Soft Amber** | `#FEF3C7` | Nền thẻ phụ, badge thông tin bàn |
| **Success Emerald** | `#10B981` | Trạng thái bàn trống, thanh toán thành công, hoàn thành món |

---

## 🔐 Bảo Mật & Lưu Ý Vận Hành
- **Mã PIN Nhân viên**: Mặc định là `1234` hoặc `8888`. Nhân viên dùng mã này tại trang Checkout để mở khóa đơn chuyển sang Barista.
- **Tài khoản Chuyển khoản VietQR**: Được cấu hình tại hằng số `BANK_INFO` trong [app/checkout/page.tsx](file:///d:/my%20project/coffee-order/app/checkout/page.tsx). Bạn có thể dễ dàng thay đổi sang tài khoản ngân hàng của quán mình.
- **Bảo mật Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY` chỉ được gọi từ môi trường server-side, tuyệt đối không lộ vào client-side bundle.

---

## 📄 Bản Quyền (License)

Dự án được phân phối dưới giấy phép mã nguồn mở **MIT License**.
