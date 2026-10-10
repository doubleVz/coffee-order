'use client'

import { useState, useEffect, useRef } from 'react'
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
import Link from 'next/link'
import { Plus, Pencil, Trash2, QrCode, Printer, TableProperties, Loader2, Armchair } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { Table } from '@/types'
import { MOCK_TABLES } from '@/lib/data/mock-data'
import toast from 'react-hot-toast'

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>(MOCK_TABLES)
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editTable, setEditTable] = useState<Table | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formName, setFormName] = useState('')
  const [formCapacity, setFormCapacity] = useState('4')
  const [formActive, setFormActive] = useState(true)
  const [qrTable, setQrTable] = useState<Table | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    fetch('/api/admin/tables')
      .then((r) => r.json())
      .then((data) => {
        setTables(data.tables || [])
        setLoading(false)
      })
  }, [])

  const resetForm = () => {
    setFormName('')
    setFormCapacity('4')
    setFormActive(true)
    setEditTable(null)
  }

  const openCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEdit = (table: Table) => {
    setEditTable(table)
    setFormName(table.name)
    setFormCapacity(table.capacity.toString())
    setFormActive(table.is_active)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên bàn')
      return
    }

    setSubmitting(true)
    try {
      const body = {
        name: formName.trim(),
        capacity: parseInt(formCapacity) || 4,
        is_active: formActive,
      }

      const url = editTable
        ? `/api/admin/tables/${editTable.id}`
        : '/api/admin/tables'
      const method = editTable ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error()

      toast.success(editTable ? 'Đã cập nhật bàn' : 'Đã tạo bàn')
      setIsDialogOpen(false)
      const data = await fetch('/api/admin/tables').then((r) => r.json())
      setTables(data.tables || [])
    } catch {
      toast.error('Không thể lưu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tables/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Đã xóa bàn')
      setTables((prev) => prev.filter((t) => t.id !== id))
    } catch {
      toast.error('Không thể xóa bàn')
    }
  }

  const handlePrintQR = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>QR Code - ${qrTable?.name}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: 'Inter', sans-serif; }
                .qr-card { text-align: center; padding: 40px; }
                .qr-card h1 { font-size: 24px; color: #3B2416; margin-bottom: 8px; }
                .qr-card h2 { font-size: 32px; color: #6F4E37; margin-bottom: 24px; }
                .qr-card p { font-size: 14px; color: #6F4E37; margin-top: 16px; }
                svg { margin: 0 auto; }
              </style>
            </head>
            <body>
              ${printContent}
              <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
          </html>
        `)
        win.document.close()
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <TableProperties className="h-10 w-10 text-[#C68B59] mx-auto animate-pulse" />
        <p className="mt-4 text-sm text-gray-500">Đang tải...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#3B2416]">Quản lý bàn</h1>
          <p className="text-xs text-gray-500 mt-0.5">Danh sách các bàn và mã QR gọi món tại bàn</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/check-ban"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors shadow-xs"
          >
            <Armchair className="h-4 w-4 text-amber-700" />
            Xem Check bàn Live 🟢
          </Link>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm bàn
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-[#3B2416]">{table.name}</h3>
                <p className="text-xs text-gray-500">Sức chứa: {table.capacity} người</p>
              </div>
              <Switch
                checked={table.is_active}
                onCheckedChange={async (checked) => {
                  await fetch(`/api/admin/tables/${table.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_active: checked }),
                  })
                  setTables((prev) =>
                    prev.map((t) => (t.id === table.id ? { ...t, is_active: checked } : t))
                  )
                }}
                aria-label="Bật/tắt bàn"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={() => setQrTable(table)}
              >
                <QrCode className="h-3.5 w-3.5" />
                QR Code
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openEdit(table)} aria-label="Sửa">
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
                    <AlertDialogTitle>Xóa bàn?</AlertDialogTitle>
                    <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(table.id)} className="bg-red-500 hover:bg-red-600">
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
      </div>

      {/* Table Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTable ? 'Sửa bàn' : 'Thêm bàn'}</DialogTitle>
            <DialogDescription>{editTable ? 'Cập nhật thông tin bàn' : 'Tạo bàn mới'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tên bàn *</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1" placeholder="Bàn 01" />
            </div>
            <div>
              <Label>Sức chứa</Label>
              <Input type="number" value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)} className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Hoạt động</Label>
              <Switch checked={formActive} onCheckedChange={setFormActive} />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editTable ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!qrTable} onOpenChange={() => setQrTable(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code - {qrTable?.name}</DialogTitle>
            <DialogDescription>Khách quét mã này để gọi món</DialogDescription>
          </DialogHeader>
          <div ref={printRef} className="text-center py-4">
            <div className="qr-card">
              <h1>COFFEE HOUSE</h1>
              <h2>{qrTable?.name}</h2>
              {qrTable && (
                <QRCodeSVG
                  value={`${appUrl}/menu?table=${qrTable.id}`}
                  size={200}
                  level="H"
                  includeMargin
                />
              )}
              <p>Quét mã để gọi món</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={handlePrintQR}>
              <Printer className="h-4 w-4" />
              In QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
