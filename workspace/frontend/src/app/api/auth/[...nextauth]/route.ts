import NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/auth';

/**
 * NextAuth.js App Router Route Handler (GET & POST)
 * Handles Google OAuth 2.0 authorization, callbacks, session endpoints, and sign-out.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
