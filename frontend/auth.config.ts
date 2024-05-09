import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import { getSecret } from '@/secret-manager';

export async function getAuthConfig() {

  return {
    callbacks: {
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        const isOnDashboard = nextUrl.pathname.startsWith('/app');
        if (isOnDashboard) {
          if (isLoggedIn) return true;
          return false; // Redirect unauthenticated users to login page
        }
        return true;
      },
      signIn({ account, profile }): boolean {

        // Only verified google accounts with gmail.com domain can login.
        if (account?.provider !== "google"
          || !profile?.email_verified
          || !profile?.email
          || !profile.email.endsWith("@gmail.com")) {
          return false
        }

        const admins = [
          'nachogutierrezibanez@gmail.com',
          'ragolegal@gmail.com',
          'n.giacomuzo@gmail.com'
        ]
        if (!admins.includes(profile.email)) {
          return false
        }

        return true
      }
    },
    providers: [
      GoogleProvider({
        clientId: await getSecret('GOOGLE_CLIENT_ID'),
        clientSecret: await getSecret('GOOGLE_CLIENT_SECRET'),
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ],
  } satisfies NextAuthConfig;
}