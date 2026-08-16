import { Mail } from 'lucide-react'
import type { PropsWithChildren } from 'react'
import { Badge } from '@/components/ui/badge'
import SignOutButton from '@/islands/SignOutButton'
import { isAdminRole } from '@/lib/utils'

type AppUser = {
  name: string
  email: string
  role?: string | null
}

export function AppShell({
  user,
  children,
}: PropsWithChildren<{ user: AppUser }>) {
  const admin = isAdminRole(user.role)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <a href="/inbox" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Mail className="size-4" />
            </span>
            CF Webmail
          </a>
          <div className="flex items-center gap-3 text-sm">
            {admin ? (
              <a
                href="/admin"
                className="text-muted-foreground hover:text-foreground"
              >
                Users
              </a>
            ) : null}
            <Badge variant="secondary">{user.email}</Badge>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}

export function AuthShell({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Mail className="size-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
