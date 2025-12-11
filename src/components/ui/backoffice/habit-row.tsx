"use client"

import React from 'react'
import { AnyHabit } from '@/types/ui'
import { DeleteIcon } from '../icons'
import { Button } from '../button'
import DeleteModal from '../habit/delete-modal'

export default function HabitRow({ habit }: { habit: AnyHabit }) {
  const name = habit.name ?? '-'
  const userName = habit.user_name ?? '-'
  const category = habit.category ?? '-'
  const color = habit.color ?? '#6366f1'
  const motivation = habit.motivation ?? ''
  const created = habit.created_at ?? null

  const [deleting, setDeleting] = React.useState(false)
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)

  const deleteHabit = async () => {
    if (!habit.id) return

    try {
      setDeleting(true)
      const res = await fetch('/api/admin/habits/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ habitId: habit.id }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => 'Erreur serveur')
        throw new Error(text || 'Failed to delete habit')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error deleting habit:', error)
      alert('Impossible de supprimer l\'habitude. Voir la console pour plus de détails.')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <>
      <div
        className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 sm:gap-4 border-3 border-primary rounded-2xl p-6"
      >
        <div className="sm:hidden text-center w-full">
          <span className="text-xl font-semibold block text-foreground">{name}</span>
        </div>

        <div className="w-full sm:w-1/5">
          <span className="block text-sm text-muted-foreground sm:hidden">Habitude</span>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color }}
              title={`Couleur: ${color}`}
            />
            <span className="block font-medium truncate text-foreground">{name}</span>
          </div>
        </div>

        <div className="w-full sm:w-1/5">
          <span className="block text-sm text-muted-foreground sm:hidden">Utilisateur</span>
          <span className="block text-sm text-foreground">{userName}</span>
        </div>

        <div className="w-full sm:w-1/5">
          <span className="block text-sm text-muted-foreground sm:hidden">Catégorie</span>
          <span className="block text-sm text-foreground">{category}</span>
        </div>

        <div className="w-full sm:w-1/5">
          <span className="block text-sm text-muted-foreground sm:hidden">Motivation</span>
          <span className="block text-sm text-foreground overflow-hidden text-ellipsis">{motivation || '-'}</span>
        </div>

        <div className="w-full sm:w-1/5 text-sm text-muted-foreground">
          <span className="block text-sm text-muted-foreground sm:hidden">Créée le</span>
          <span className="text-foreground text-base">{created ? new Date(created).toLocaleString() : '-'}</span>
        </div>

        <div className="w-full mt-4 flex justify-center sm:justify-end">
          <Button
            variant="transparent"
            size="small"
            onClick={() => setShowDeleteModal(true)}
            title="Supprimer l'habitude"
          >
            <DeleteIcon />
            <span className="ml-2">Supprimer</span>
          </Button>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={deleteHabit}
          pendingDeleteId={habit.id}
          deletingIds={deleting ? [habit.id] : []}
        />
      )}
    </>
  )
}