import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/user';

export const authOptions = {
  session: {
    strategy: 'jwt',
  },

  providers: [
  
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      httpOptions: { timeout: 10000 },
    }),

    
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();

        const { email, password } = credentials;
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error('Invalid email or password');
        }

        if (!user?.password) {
          throw new Error('Please login via Google');
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
          throw new Error('Invalid email or password');
        }

        return user;
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      await dbConnect();
      const { email } = user;

      let dbUser = await User.findOne({ email });

      
      if (!dbUser) {
        dbUser = await User.create({
          email,
          name: user?.name,
          image: user?.image,
          password: null,
        });
      }

      return true;
    },

    async jwt({ token }) {
      await dbConnect();
      const dbUser = await User.findOne({ email: token.email }).select(
        '-password'
      );
      token.user = dbUser;
      return token;
    },

    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },

  secret: process.env.NEXT_AUTH_SECRET,

  pages: {
    signIn: '/login',
  },
};
