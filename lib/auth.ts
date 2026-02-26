import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'
import { prisma } from './db'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
  ],
  user: {
    additionalFields: {
      approved: {
        type: 'boolean',
        defaultValue: false,
      },
      role: {
        type: 'string',
        defaultValue: 'user',
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || 'https://leo-fodi.fodivps2.cloud',
  ],
})

export type Session = typeof auth.$Infer.Session
