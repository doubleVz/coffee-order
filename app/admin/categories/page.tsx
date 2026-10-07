'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Plus, Pencil, Trash2, FolderOpen, Loader2 } from 'lucide-react'
import type { Category } from '@/types'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formActive, setFormActive] = useState(true)
  const [formOrder, setFormOrder] = useState('0')

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || [])
        setLoading(false)
      })
  }, [])

  const resetForm = () => {
    setFormName('')
    setFormDesc('')
    setFormActive(true)
    setFormOrder('0')
    setEditCategory(null)
  }

  const openCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditCategory(cat)
    setFormName(cat.name)
    setFormDesc(cat.description || '')
    setFormActive(cat.is_active)
    setFormOrder(cat.sort_order.toString())
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    setSubmitting(true)
    try {
      const body = {
        name: formName.trim(),
        description: formDesc.trim() || null,
        is_active: formActive,
        sort_order: parseInt(formOrder) || 0,
      }

      const url = editCategory
        ? `/api/admin/categories/${editCategory.id}`
        : '/api/admin/categories'
      const method = editCategory ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Lỗi')
      }

      toast.success(editCategory ? 'Đã cập nhật' : 'Đã tạo')
      setIsDialogOpen(false)
      const data = await fetch('/api/admin/categories').then((r) => r.json())
      setCategories(data.categories || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Lỗi')
      }
      toast.success('Đã xóa danh mục')
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <FolderOpen className="h-10 w-10 text-[#C68B59] mx-auto animate-pulse" />
        <p className="mt-4 text-sm text-gray-500">Đang tải...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3B2416]">Danh mục</h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      <div className="grid gap-3">
        {categories.map((cat) => (
          <Card key={cat.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F8F3EA] flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-[#C68B59]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#3B2416] text-sm">{cat.name}</h3>
                {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
                <p className="text-xs text-gray-400">Thứ tự: {cat.sort_order}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={cat.is_active}
                  onCheckedChange={async (checked) => {
                    await fetch(`/api/admin/categories/${cat.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ is_active: checked }),
                    })
                    setCategories((prev) =>
                      prev.map((c) => (c.id === cat.id ? { ...c, is_active: checked } : c))
                    )
                  }}
                  aria-label="Bật/tắt"
                />
                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)} aria-label="Sửa">
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
                      <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Nếu danh mục còn sản phẩm, bạn cần chuyển sản phẩm sang danh mục khác trước.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-red-500 hover:bg-red-600">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</DialogTitle>
            <DialogDescription>
              {editCategory ? 'Cập nhật thông tin danh mục' : 'Tạo danh mục mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Thứ tự</Label>
              <Input type="number" value={formOrder} onChange={(e) => setFormOrder(e.target.value)} className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Hiện</Label>
              <Switch checked={formActive} onCheckedChange={setFormActive} />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editCategory ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
