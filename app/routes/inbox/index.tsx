import { desc, eq } from 'drizzle-orm'
import { createRoute } from 'honox/factory'
import { AppShell } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { emails } from '@/lib/db/schema'
import { formatDate } from '@/lib/utils'

export default createRoute(async (c) => {
  const session = c.get('session')
  if (!session) {
    return c.redirect('/login')
  }

  const rows = await c
    .get('db')
    .select()
    .from(emails)
    .where(eq(emails.userId, session.user.id))
    .orderBy(desc(emails.receivedAt))
    .limit(100)

  return c.render(
    <AppShell user={session.user}>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Mail sent to {session.user.email}. Sending is disabled.
        </p>
      </div>
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No messages yet. Incoming mail is stored only if this mailbox exists.
          </div>
        ) : (
          <ul>
            {rows.map((email) => {
              const unread = !email.readAt
              return (
                <li key={email.id} className="border-b last:border-b-0">
                  <a
                    href={`/inbox/${email.id}`}
                    className="grid gap-1 px-4 py-3 hover:bg-accent md:grid-cols-[minmax(0,14rem)_1fr_auto] md:items-center"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {unread ? <Badge>New</Badge> : null}
                      <span className={unread ? 'font-semibold' : 'text-muted-foreground'}>
                        {email.fromName || email.fromAddress}
                      </span>
                    </div>
                    <div className="truncate">
                      <span className={unread ? 'font-medium' : undefined}>
                        {email.subject}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(email.receivedAt)}
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </AppShell>,
    { title: 'Inbox' },
  )
})
