import { and, eq } from 'drizzle-orm'
import { Paperclip } from 'lucide-react'
import { createRoute } from 'honox/factory'
import { AppShell } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { emails } from '@/lib/db/schema'
import { formatDate } from '@/lib/utils'

type AttachmentMeta = {
  filename: string
  mimeType: string
  size: number
}

export default createRoute(async (c) => {
  const session = c.get('session')
  if (!session) {
    return c.redirect('/login')
  }

  const id = c.req.param('id')
  if (!id) {
    return c.notFound()
  }
  const db = c.get('db')
  const [email] = await db
    .select()
    .from(emails)
    .where(and(eq(emails.id, id), eq(emails.userId, session.user.id)))
    .limit(1)

  if (!email) {
    return c.notFound()
  }

  if (!email.readAt) {
    await db.update(emails).set({ readAt: new Date() }).where(eq(emails.id, email.id))
  }

  const attachments = email.attachments
    ? (JSON.parse(email.attachments) as AttachmentMeta[])
    : []

  return c.render(
    <AppShell user={session.user}>
      <a href="/inbox" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back to inbox
      </a>
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl leading-tight">{email.subject}</CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>
              {email.fromName ? `${email.fromName} <${email.fromAddress}>` : email.fromAddress}
            </span>
            <span>·</span>
            <span>to {email.toAddress}</span>
            <span>·</span>
            <span>{formatDate(email.receivedAt)}</span>
            {attachments.length ? (
              <Badge variant="secondary" className="gap-1">
                <Paperclip className="size-3" />
                {attachments.length}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {attachments.length ? (
            <div className="mb-4 rounded-md border bg-muted/40 p-3 text-sm">
              <p className="mb-2 font-medium">Attachments (names only)</p>
              <ul className="space-y-1 text-muted-foreground">
                {attachments.map((attachment) => (
                  <li key={`${attachment.filename}-${attachment.size}`}>
                    {attachment.filename} · {attachment.mimeType}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {email.htmlBody ? (
            <iframe
              title="Email body"
              sandbox=""
              className="h-[70vh] w-full rounded-md border bg-white"
              srcDoc={email.htmlBody}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
              {email.textBody || '(empty message)'}
            </pre>
          )}
        </CardContent>
      </Card>
    </AppShell>,
    { title: email.subject ?? 'Message' },
  )
})
