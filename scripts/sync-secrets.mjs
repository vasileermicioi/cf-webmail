import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

function parseEnvFile(path) {
  const values = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    values[key] = value
  }
  return values
}

const source = existsSync('.dev.vars') ? '.dev.vars' : '.env'
if (!existsSync(source)) {
  throw new Error('Missing .dev.vars or .env with DATABASE_URL and BETTER_AUTH_SECRET')
}

const env = parseEnvFile(source)
const secrets = {}

for (const key of ['DATABASE_URL', 'BETTER_AUTH_SECRET']) {
  if (!env[key]) {
    throw new Error(`Missing ${key} in ${source}`)
  }
  secrets[key] = env[key]
}

const authUrl = env.BETTER_AUTH_URL
if (
  authUrl &&
  !authUrl.includes('localhost') &&
  !authUrl.includes('127.0.0.1')
) {
  secrets.BETTER_AUTH_URL = authUrl
}

const file = join(tmpdir(), `cf-webmail-secrets-${process.pid}.env`)
writeFileSync(
  file,
  Object.entries(secrets)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join('\n') + '\n',
)

try {
  const result = spawnSync(
    'npx',
    ['wrangler', 'secret', 'bulk', file],
    { stdio: 'inherit' },
  )
  process.exit(result.status ?? 1)
} finally {
  unlinkSync(file)
}
