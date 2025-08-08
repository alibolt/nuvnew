import { AuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize called with:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          throw new Error('Invalid credentials');
        }

        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        console.log('👤 User found:', user ? 'Yes' : 'No');

        // If user doesn't exist, create it (for demo purposes)
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              name: credentials.email.split('@')[0],
            }
          });
          console.log('✅ New user created');
        } else {
          // Verify password for existing user
          if (!user.password) {
            console.log('❌ User has no password');
            throw new Error('Invalid credentials');
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔑 Password correct:', isPasswordCorrect);

          if (!isPasswordCorrect) {
            throw new Error('Invalid credentials');
          }
        }

        console.log('✅ Returning user:', user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      // Impersonation logic - Note: cookies() only works in Server Components
      // For now, we'll disable impersonation in the auth options
      // const impersonateTargetUserId = cookies().get('impersonate_target_user_id')?.value;
      // if (impersonateTargetUserId) {
      //   const targetUser = await prisma.user.findUnique({
      //     where: { id: impersonateTargetUserId },
      //     select: { id: true, name: true, email: true, role: true },
      //   });
      //   if (targetUser) {
      //     token.id = targetUser.id;
      //     token.name = targetUser.name;
      //     token.email = targetUser.email;
      //     token.role = targetUser.role; // Set the role to the target user's role
      //   }
      // }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string; // Ensure name is also updated
        session.user.email = token.email as string; // Ensure email is also updated
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};