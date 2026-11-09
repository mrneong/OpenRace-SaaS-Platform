import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export interface SyncUserData {
  name?: string | null;
  email: string;
  image?: string | null;
  role?: 'ATHLETE' | 'COACH' | 'CAPTAIN' | 'ADMIN';
}

/**
 * Synchronize Google OAuth Profile with PostgreSQL Database (Prisma / NestJS Backend)
 * Requirement 2:
 * - Check if user with email already exists.
 * - If not: Create new record with name, email, image, role = 'ATHLETE'.
 * - If exists: Update latest information and allow sign-in.
 */
export async function syncGoogleUserWithDatabase(data: SyncUserData) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${backendUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        googleEmail: data.email,
        googleName: data.name || data.email.split('@')[0],
        googlePicture: data.image || 'https://lh3.googleusercontent.com/a/default-avatar',
        role: data.role || 'ATHLETE'
      })
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.warn('Backend sync returned non-200 status:', res.status, errBody);
    }
    return await res.json().catch(() => ({ success: true }));
  } catch (err) {
    console.error('Error syncing Google user with backend datastore:', err);
    // Return graceful fallback so user authentication does not completely crash
    return { success: true, email: data.email, role: 'ATHLETE' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock-google-client-id.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-client-secret',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile'
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 Days
  },
  callbacks: {
    /**
     * Callbacks & Database Sync:
     * When user signs in with Google, check email in PostgreSQL database / Prisma.
     * Auto-create new record with role ATHLETE or update existing record.
     */
    async signIn({ user, account, profile }) {
      if (!user?.email) {
        console.error('Google OAuth sign-in failed: No email provided in profile');
        return false;
      }

      try {
        const syncResult = await syncGoogleUserWithDatabase({
          name: user.name || (profile as any)?.name || 'Vận Động Viên',
          email: user.email,
          image: user.image || (profile as any)?.picture,
          role: 'ATHLETE'
        });

        // Store role onto user object for subsequent token/session callbacks
        (user as any).role = syncResult?.user?.roleName || 'ATHLETE';
        (user as any).dbId = syncResult?.user?.id;
        return true;
      } catch (error) {
        console.error('Failed to sync Google user with PostgreSQL:', error);
        return true; // Still allow sign in to proceed gracefully
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).dbId || user.id;
        token.role = (user as any).role || 'ATHLETE';
        token.provider = account?.provider || 'google';
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = (token.role as string) || 'ATHLETE';
        (session.user as any).provider = (token.provider as string) || 'google';
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  secret: process.env.NEXTAUTH_SECRET || 'super_secure_nextauth_jwt_secret_openrace_v3_33_2026'
};
