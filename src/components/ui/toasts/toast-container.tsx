"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CrossIcon, BadgeIcons } from '../icons'
import { Button } from '../button'
import { Toast } from '@/types/ui'

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const router = useRouter()

  const removeToast = (id: string) => setToasts((s) => s.filter(x => x.id !== id))

  const handleClick = (t: Toast) => {
    if (t.type === 'badge') {
      router.push('/badges')
    } else if (t.type === 'recommendation' && t.onClick) {
      t.onClick()
    }
    removeToast(t.id)
  }

  useEffect(() => {
    const handleAddToast = (e: any) => {
      const toast = e?.detail
      if (!toast) return
      setToasts((s) => [toast, ...s])
    }

    window.addEventListener('toast:add', handleAddToast as EventListener)
    return () => {
      window.removeEventListener('toast:add', handleAddToast as EventListener)
    }
  }, [])

  useEffect(() => {
    const handleRecommendation = (e: any) => {
      const { title, message, onClick, onClose } = e?.detail ?? {}
      if (!title || !message) return
      
      window.dispatchEvent(new CustomEvent('toast:add', {
        detail: {
          id: `rec-${Date.now()}`,
          title,
          message,
          type: 'recommendation',
          onClick: onClick || (() => {}),
          onClose: onClose || (() => {})
        }
      }))
    }

    window.addEventListener('recommendation:show', handleRecommendation as EventListener)
    return () => {
      window.removeEventListener('recommendation:show', handleRecommendation as EventListener)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 inset-x-3 z-[70] flex flex-col gap-2">
      {toasts.map((t) => {
        const BadgeIcon = t.type === 'badge' && t.title 
          ? BadgeIcons[(t.title.charAt(0).toUpperCase() + t.title.slice(1)) as keyof typeof BadgeIcons]
          : null

        return (
          <div 
            key={t.id} 
            className="w-auto max-w-full sm:max-w-md md:max-w-lg border-2 border-primary bg-background rounded-lg px-4 py-3 flex justify-between items-center gap-3 shadow-md"
          >
            {t.type === 'badge' && BadgeIcon && (
              <div className="flex-shrink-0 w-10 h-10">
                {BadgeIcon()}
              </div>
            )}
            <div 
              className="cursor-pointer flex-1"
              onClick={() => handleClick(t)}
            >
              <div className="text-sm font-semibold text-primary">{t.title}</div>
              <div className="text-xs text-foreground">{t.message}</div>
            </div>
            <Button
              variant="transparent"
              size="paddingless"
              onClick={(e) => {
                e.stopPropagation()
                if (t.type === 'recommendation' && t.onClose) {
                  t.onClose()
                }
                removeToast(t.id)
              }}
              aria-label="Fermer"
            >
              <CrossIcon />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
