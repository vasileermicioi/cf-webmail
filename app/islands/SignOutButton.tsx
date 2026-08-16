import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export default function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        await authClient.signOut()
        window.location.href = '/login'
      }}
    >
      Sign out
    </Button>
  )
}
