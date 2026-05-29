import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'silvia@espaciosinter.com.ar' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son obligatorios')
        }

        const usuario = await db.usuario.findUnique({
          where: { email: credentials.email },
        })

        if (!usuario) {
          throw new Error('Credenciales inválidas')
        }

        if (!usuario.activo) {
          throw new Error('Tu cuenta está desactivada. Contactá al administrador.')
        }

        const isValidPassword = await bcrypt.compare(credentials.password, usuario.password)

        if (!isValidPassword) {
          throw new Error('Credenciales inválidas')
        }

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          role: usuario.rol,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string
        ;(session.user as { role: string }).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
