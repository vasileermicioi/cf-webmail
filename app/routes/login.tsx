import { createRoute } from 'honox/factory'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthShell } from '@/components/layout'
import LoginForm from '@/islands/LoginForm'

export default createRoute((c) => {
  if (c.get('session')) {
    return c.redirect('/inbox')
  }

  return c.render(
    <AuthShell
      title="Sign in"
      description="Only invited mailboxes can access this inbox."
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Use the mailbox address an admin created for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </AuthShell>,
    { title: 'Sign in' },
  )
})
