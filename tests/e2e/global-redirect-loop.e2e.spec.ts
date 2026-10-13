import { expect, test } from '@playwright/test'
import { createClient } from '@libsql/client'
import { login } from '../helpers/login'

const adminUser = { email: 'admin@example.com', password: 'TestPassword123!' }

test('opening a missing tenant singleton loops through draft redirects', async ({ page }) => {
  const database = createClient({ url: process.env.DATABASE_URL ?? 'file:./payload.db' })

  try {
    await login({ page, serverURL: 'http://localhost:3001', user: adminUser })
    const request = page.context().request
    const draftsBefore = await countDraftDocuments(database)

    const listResponse = await request.get('/admin/collections/navigation-content', { maxRedirects: 0 })
    expect(listResponse.status()).toBe(307)
    let route = listResponse.headers().location!
    expect(route).toMatch(/^\/admin\/collections\/navigation-content\/\d+$/)

    const documentIDs: number[] = []
    const statuses: number[] = []
    for (let index = 0; index < 4; index += 1) {
      documentIDs.push(Number(route.split('/').at(-1)))
      const response = await request.get(route, { maxRedirects: 0 })
      statuses.push(response.status())
      if (response.status() !== 307) break
      route = response.headers().location!
      expect(route).toMatch(/^\/admin\/collections\/navigation-content\/\d+$/)
      documentIDs.push(Number(route.split('/').at(-1)))
    }

    const draftsAfter = await countDraftDocuments(database)
    expect(
      draftsAfter - draftsBefore,
      `Opening the missing singleton should expose the bug by creating drafts. IDs: ${documentIDs.join(' -> ')}`,
    ).toBeGreaterThan(0)
    expect(
      statuses,
      `The singleton edit route should render after the initial redirect. Instead it redirected through IDs ${documentIDs.join(' -> ')}`,
    ).toEqual([200])
  } finally {
    await database.close()
  }
})

async function countDraftDocuments(database: ReturnType<typeof createClient>) {
  const result = await database.execute("SELECT COUNT(*) AS count FROM navigation_content WHERE _status = 'draft'")
  return Number(result.rows[0]?.count ?? 0)
}
