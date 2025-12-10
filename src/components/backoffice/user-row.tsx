"use client"

type AnyUser = Record<string, any>

export default function UserRow({ user }: { user: AnyUser }) {
  const firstName = user.firstName ?? user.first_name ?? ''
  const lastName = user.lastName ?? user.last_name ?? ''
  const fullName = `${firstName} ${lastName}`|| '-'
  const created = user.createdAt ?? user.created_at ?? null
  const isAdmin = (user.is_admin ?? user.isAdmin) === true
  return (
    <section
      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2 sm:gap-4 border-3 border-primary rounded-2xl p-6"
    >
      <div className="sm:hidden text-center w-full">
        <span className="text-xl font-semibold block text-foreground">{fullName}</span>
      </div>

      <div className="w-full sm:w-1/3">
        <span className="block text-sm text-muted-foreground sm:hidden">Email</span>
        <span className="block font-medium truncate text-foreground">{user.email}</span>
      </div>

      <span className="w-full sm:w-1/4 hidden sm:block text-sm text-foreground">{fullName}</span>

      <div className="w-full sm:w-1/6 text-sm">
        <span className="block text-sm text-muted-foreground sm:hidden">Rôle</span>
        <span className={isAdmin ? 'text-primary font-medium text-base' : 'text-muted-foreground sm:text-foreground text-base'}>{isAdmin ? 'Admin' : 'Utilisateur'}</span>
      </div>

      <div className="w-full sm:w-1/6 text-sm text-muted-foreground">
        <span className="block text-sm text-muted-foreground sm:hidden">Points</span>
        <span className="text-foreground text-base">{user.points ?? 0} pts</span>
      </div>

      <div className="w-full sm:w-1/6 text-sm text-muted-foreground">
        <span className="block text-sm text-muted-foreground sm:hidden">Créé le</span>
        <span className="text-foreground text-base">{created ? new Date(created).toLocaleString() : '-'}</span>
      </div>
    </section>
  )
}
