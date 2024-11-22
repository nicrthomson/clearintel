import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { User } from "@prisma/client"

async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email }
  })
}

async function validatePassword(user: User, password: string): Promise<boolean> {
  if (!user.password) return false
  return compare(password, user.password)
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id)
        token.organization_id = user.organization_id ? Number(user.organization_id) : null
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = Number(token.id)
        session.user.organization_id = token.organization_id ? Number(token.organization_id) : null
        session.user.role = token.role as string
      }
      return session
    }
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await getUserByEmail(credentials.email)
        if (!user) {
          return null
        }

        const isValid = await validatePassword(user, credentials.password)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organization_id: user.organization_id,
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  }
}
