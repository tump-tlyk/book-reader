import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import db from './db';

export const authOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mat khau', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = db
          .prepare('SELECT * FROM users WHERE email = ?')
          .get(credentials.email);
        if (!user || !user.password) return null;
        const valid = bcrypt.compareSync(credentials.password, user.password);
        if (!valid) return null;
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existing = db
          .prepare('SELECT * FROM users WHERE email = ?')
          .get(user.email);
        if (existing) {
          const linked = db
            .prepare(
              'SELECT * FROM accounts WHERE provider = ? AND provider_account_id = ?'
            )
            .get('google', account.providerAccountId);
          if (!linked) {
            db.prepare(
              'INSERT INTO accounts (user_id, provider, provider_account_id) VALUES (?, ?, ?)'
            ).run(existing.id, 'google', account.providerAccountId);
          }
        } else {
          const result = db
            .prepare('INSERT INTO users (name, email, image) VALUES (?, ?, ?)')
            .run(user.name, user.email, user.image);
          db.prepare(
            'INSERT INTO accounts (user_id, provider, provider_account_id) VALUES (?, ?, ?)'
          ).run(result.lastInsertRowid, 'google', account.providerAccountId);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = db
          .prepare('SELECT * FROM users WHERE email = ?')
          .get(user.email);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.subscriptionPlan = dbUser.subscription_plan;
          token.subscriptionEnd = dbUser.subscription_end;
        }
      } else if (token?.id) {
        const dbUser = db
          .prepare('SELECT * FROM users WHERE id = ?')
          .get(token.id);
        if (dbUser) {
          token.role = dbUser.role;
          token.subscriptionPlan = dbUser.subscription_plan;
          token.subscriptionEnd = dbUser.subscription_end;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.subscriptionPlan = token.subscriptionPlan;
        session.user.subscriptionEnd = token.subscriptionEnd;
        session.user.isPremium = token.subscriptionEnd
          ? new Date(token.subscriptionEnd) > new Date()
          : false;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};
