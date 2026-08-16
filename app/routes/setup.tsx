import { count } from 'drizzle-orm'
import { createRoute } from 'honox/factory'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthShell } from '@/components/layout'
import SetupForm from '@/islands/SetupForm'
import { user } from '@/lib/db/schema'

export default createRoute(async (c) => {
  if (c.get('session')) {
    return c.redirect('/inbox')
  }

  const db = c.get('db')
  const [row] = await db.select({ value: count() }).from(user)
  if (row?.value) {
    return c.redirect('/login')
  }

  return c.render(
    <AuthShell
      title="Create the first admin"
      description="Public signup is disabled. This setup page is only available when the database has no users."
    >
      <Card>
        <CardHeader>
          <CardTitle>Admin account</CardTitle>
          <CardDescription>
            Use the mailbox address this worker should receive mail for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetupForm />
        </CardContent>
      </Card>
    </AuthShell>,
    { title: 'Setup' },
  )
})
