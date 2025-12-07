"use client"

import { useEffect } from 'react'

export default function BadgesToast() {
  useEffect(() => {
    function onAward(e: any) {
      const badges = e?.detail ?? []
      if (!Array.isArray(badges) || badges.length === 0) return
      
      badges.forEach((b: any, i: number) => {
        window.dispatchEvent(new CustomEvent('toast:add', {
          detail: {
            id: `badge-${Date.now()}-${i}`,
            title: b.name,
            message: 'Nouveau badge obtenu',
            type: 'badge'
          }
        }))
      })
    }

    window.addEventListener('badge:awarded', onAward as EventListener)
    return () => window.removeEventListener('badge:awarded', onAward as EventListener)
  }, [])

  return null
}
