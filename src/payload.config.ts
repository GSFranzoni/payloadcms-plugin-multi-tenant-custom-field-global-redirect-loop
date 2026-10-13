import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    {
      slug: 'tenants',
      admin: { useAsTitle: 'name' },
      fields: [{ name: 'name', type: 'text', required: true }],
    },
    {
      slug: 'navigation-content',
      admin: { useAsTitle: 'label' },
      fields: [{ name: 'label', type: 'text', required: true }],
      versions: { drafts: { autosave: { interval: 1000 } } },
    },
    Users,
    Media,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    multiTenantPlugin({
      tenantsSlug: 'tenants',
      tenantField: { name: 'organization' },
      tenantsArrayField: { includeDefaultField: true },
      collections: { 'navigation-content': { isGlobal: true } },
      userHasAccessToAllTenants: (user: { role?: string }) => user.role === 'super-admin',
    }),
  ],
})
