// Enables WAL mode on the SQLite database using the @libsql/client
import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const dbPath = resolve('./db/custom.db')
const client = createClient({ url: `file:${dbPath}` })

await client.execute('PRAGMA journal_mode=WAL')
const result = await client.execute('PRAGMA journal_mode')
console.log('Journal mode:', result.rows[0][0])
await client.close()
console.log('Done! You can now upload custom.db to Turso.')
