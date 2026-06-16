import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

        if (!user) throw new Error('No account found with this email');

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) throw new Error('Invalid password');

        return {
          id:    user._id.toString(),
          email: user.email,
          name:  user.name,
          role:  user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as { role?: string }).role ?? 'user';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id     = token.id as string;
        (session.user as { role?: string }).role  = token.role as string;
      }
      return session;
    },
  },
};
