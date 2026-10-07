'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#2B2118',
          color: '#FFFDF8',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#6F4E37',
            secondary: '#FFFDF8',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#FFFDF8',
          },
        },
      }}
    />
  )
}
