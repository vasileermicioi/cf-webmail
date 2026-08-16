import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeEmail(address: string) {
  const trimmed = address.trim().toLowerCase()
  const match = trimmed.match(/<([^>]+)>/)
  return match?.[1] ?? trimmed
}

export function mailboxAddress(
  value?: { address?: string; name?: string } | null,
) {
  if (!value?.address) return null
  return normalizeEmail(value.address)
}

export function formatDate(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function isAdminRole(role?: string | null) {
  return role === 'admin' || (role?.split(',').includes('admin') ?? false)
}
