'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, Coffee, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Product, Category } from '@/types'
import toast from 'react-hot-toast'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formAvailable, setFormAvailable] = useState(true)
  const [formFeatured, setFormFeatured] = useState(false)
  const [formBestSeller, setFormBestSeller] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/products').then((r) => r.json()),
      fetch('/api/admin/categories').then((r) => r.json()),
    ]).then(([prodData, catData]) => {
      setProducts(prodData.products || [])
      setCategories(catData.categories || [])
      setLoading(false)
    })
  }, [])

  const resetForm = () => {
    setFormName('')
    setFormDesc('')
    setFormPrice('')
    setFormCategoryId('')
    setFormImageUrl('')
    setFormAvailable(true)
    setFormFeatured(false)
    setFormBestSeller(false)
    setEditProduct(null)
  }

  const openCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditProduct(product)
    setFormName(product.name)
    setFormDesc(product.description || '')
    setFormPrice(product.price.toString())
    setFormCategoryId(product.category_id)
    setFormImageUrl(product.image_url || '')
    setFormAvailable(product.is_available)
    setFormFeatured(product.is_featured)
    setFormBestSeller(product.is_best_seller)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim() || !formPrice || !formCategoryId) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setSubmitting(true)
    try {
      const body = {
        name: formName.trim(),
        description: formDesc.trim() || null,
        price: parseInt(formPrice),
        category_id: formCategoryId,
        image_url: formImageUrl.trim() || null,
        is_available: formAvailable,
        is_featured: formFeatured,
        is_best_seller: formBestSeller,
      }

      const url = editProduct
        ? `/api/admin/products/${editProduct.id}`
        : '/api/admin/products'
      const method = editProduct ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error()

      toast.success(editProduct ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm')
      setIsDialogOpen(false)
      // Refresh
      const data = await fetch('/api/admin/products').then((r) => r.json())
      setProducts(data.products || [])
    } catch {
      toast.error('Không thể lưu sản phẩm')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Đã xóa sản phẩm')
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      toast.error('Không thể xóa sản phẩm')
    }
  }

  const toggleAvailable = async (product: Product) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !product.is_available }),
      })
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_available: !p.is_available } : p))
      )
      toast.success(product.is_available ? 'Đã ẩn sản phẩm' : 'Đã hiện sản phẩm')
    } catch {
      toast.error('Không thể cập nhật')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <Coffee className="h-10 w-10 text-[#C68B59] mx-auto animate-pulse" />
        <p className="mt-4 text-sm text-gray-500">Đang tải...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3B2416]">Sản phẩm</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm món
        </Button>
      </div>

      <div className="grid gap-3">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#F8F3EA] flex items-center justify-center shrink-0">
                <Coffee className="h-6 w-6 text-[#C68B59]/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[#3B2416] text-sm truncate">{product.name}</h3>
                  {!product.is_available && <Badge variant="destructive" className="text-xs">Ẩn</Badge>}
                  {product.is_best_seller && <Badge variant="warning" className="text-xs">Bán chạy</Badge>}
                </div>
                <p className="text-xs text-gray-500">{product.category?.name}</p>
                <p className="text-sm font-bold text-[#C68B59] mt-1">{formatCurrency(product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={product.is_available}
                  onCheckedChange={() => toggleAvailable(product)}
                  aria-label="Bật/tắt sản phẩm"
                />
                <Button variant="ghost" size="icon" onClick={() => openEdit(product)} aria-label="Sửa">
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500" aria-label="Xóa">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc muốn xóa &quot;{product.name}&quot;? Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-red-500 hover:bg-red-600">
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
            <DialogDescription>
              {editProduct ? 'Cập nhật thông tin sản phẩm' : 'Tạo sản phẩm mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1" placeholder="Bạc xỉu" />
            </div>
            <div>
              <Label>Giá (VNĐ) *</Label>
              <Input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="mt-1" placeholder="35000" />
            </div>
            <div>
              <Label>Danh mục *</Label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="mt-1 w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="mt-1" rows={2} />
            </div>
            <div>
              <Label>URL hình ảnh</Label>
              <Input value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} className="mt-1" placeholder="https://..." />
            </div>
            <div className="flex items-center justify-between">
              <Label>Còn hàng</Label>
              <Switch checked={formAvailable} onCheckedChange={setFormAvailable} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Nổi bật</Label>
              <Switch checked={formFeatured} onCheckedChange={setFormFeatured} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Bán chạy</Label>
              <Switch checked={formBestSeller} onCheckedChange={setFormBestSeller} />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editProduct ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
