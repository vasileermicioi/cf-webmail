import { eq, sql } from 'drizzle-orm'
import PostalMime from 'postal-mime'
import { createDb } from './lib/db'
import { emails, user } from './lib/db/schema'
import { mailboxAddress, normalizeEmail } from './lib/utils'

const MAX_BODY_CHARS = 1_000_000

function truncate(value: string | undefined, max = MAX_BODY_CHARS) {
  if (!value) return null
  return value.length > max ? value.slice(0, max) : value
}

export async function handleIncomingEmail(
  message: ForwardableEmailMessage,
  env: CloudflareBindings,
  _ctx: ExecutionContext,
) {
  const db = createDb(env)
  const recipient = normalizeEmail(message.to)

  const [mailbox] = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(sql`lower(${user.email}) = ${recipient}`)
    .limit(1)

  if (!mailbox) {
    console.log(`Dropping mail for unknown recipient: ${recipient}`)
    return
  }

  const rawBuffer = await new Response(message.raw).arrayBuffer()
  const parsed = await PostalMime.parse(rawBuffer)
  const from =
    mailboxAddress(parsed.from) ??
    mailboxAddress(parsed.sender) ??
    normalizeEmail(message.from)

  const attachmentMeta = (parsed.attachments ?? []).map((attachment) => ({
    filename: attachment.filename ?? 'untitled',
    mimeType: attachment.mimeType,
    size:
      typeof attachment.content === 'string'
        ? attachment.content.length
        : (attachment.content?.byteLength ?? 0),
  }))

  await db.insert(emails).values({
    id: crypto.randomUUID(),
    userId: mailbox.id,
    messageId: parsed.messageId ?? message.headers.get('message-id'),
    fromAddress: from,
    fromName: parsed.from?.name || null,
    toAddress: recipient,
    subject: parsed.subject || '(no subject)',
    textBody: truncate(parsed.text),
    htmlBody: truncate(parsed.html),
    attachments: attachmentMeta.length ? JSON.stringify(attachmentMeta) : null,
    rawSize: message.rawSize,
    receivedAt: new Date(),
  })
}

export async function markEmailRead(
  db: ReturnType<typeof createDb>,
  emailId: string,
) {
  await db
    .update(emails)
    .set({ readAt: new Date() })
    .where(eq(emails.id, emailId))
}
