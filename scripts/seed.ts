import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const payload = await getPayload({ config })

try {
  const existingUser = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@example.com' } },
    limit: 1,
    overrideAccess: true,
  })

  if (existingUser.docs[0]) {
    await payload.update({
      collection: 'users',
      id: existingUser.docs[0].id,
      data: { password: 'TestPassword123!', role: 'super-admin' },
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@example.com',
        password: 'TestPassword123!',
        role: 'super-admin',
      },
      overrideAccess: true,
    })
  }

  const alpha = await findOrCreateTenant('Alpha — missing singleton')
  const beta = await findOrCreateTenant('Beta — has singleton')
  const betaSingleton = await payload.find({
    collection: 'navigation-content',
    draft: true,
    where: { organization: { equals: beta.id } },
    limit: 1,
    overrideAccess: true,
  })

  if (!betaSingleton.docs.length) {
    await payload.create({
      collection: 'navigation-content',
      data: { label: 'Beta navigation', organization: beta.id },
      draft: true,
      overrideAccess: true,
    })
  }

  console.log(`Seeded ${alpha.name} (no singleton) and ${beta.name} (singleton present).`)
  console.log('Admin login: admin@example.com / TestPassword123!')
} finally {
  await payload.destroy()
}

async function findOrCreateTenant(name: string) {
  const result = await payload.find({
    collection: 'tenants',
    where: { name: { equals: name } },
    limit: 1,
    overrideAccess: true,
  })

  return result.docs[0] ?? payload.create({
    collection: 'tenants',
    data: { name },
    overrideAccess: true,
  })
}
