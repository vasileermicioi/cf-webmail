import { desc } from 'drizzle-orm'
import { createRoute } from 'honox/factory'
import { AppShell } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import CreateUserForm from '@/islands/CreateUserForm'
import { user } from '@/lib/db/schema'
import { formatDate, isAdminRole } from '@/lib/utils'

export default createRoute(async (c) => {
  const session = c.get('session')
  if (!session) {
    return c.redirect('/login')
  }

  const users = await c.get('db').select().from(user).orderBy(desc(user.createdAt))

  return c.render(
    <AppShell user={session.user}>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Only admins can create mailboxes. Incoming mail is stored only for these addresses.
        </p>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create user</CardTitle>
            <CardDescription>
              The email address is the mailbox Cloudflare Email Routing should deliver to.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateUserForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing mailboxes</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-b-0">
                    <td className="py-3">{entry.name}</td>
                    <td className="py-3">{entry.email}</td>
                    <td className="py-3">
                      <Badge variant={isAdminRole(entry.role) ? 'default' : 'secondary'}>
                        {entry.role ?? 'user'}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(entry.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>,
    { title: 'Users' },
  )
})
