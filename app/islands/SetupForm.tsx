import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

export default function SetupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault()
        setPending(true)
        setError(null)

        const response = await fetch('/api/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        })
        const payload = (await response.json()) as { error?: string }

        if (!response.ok) {
          setPending(false)
          setError(payload.error ?? 'Unable to create the admin account')
          return
        }

        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        })
        setPending(false)
        if (signInError) {
          setError(signInError.message ?? 'Admin created, but sign-in failed')
          return
        }
        window.location.href = '/inbox'
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Admin mailbox</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="you@your-domain.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? 'Creating admin…' : 'Create admin'}
      </Button>
    </form>
  )
}
