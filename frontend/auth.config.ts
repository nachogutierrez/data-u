import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";

const WHITELISTED = [
  'nachogutierrezibanez@gmail.com',
  'ragolegal@gmail.com',
  'n.giacomuzo@gmail.com'
]

const ADMINS = [
  'nachogutierrezibanez@gmail.com'
]

export function isAdmin(user: string): boolean {
  return ADMINS.includes(user)
}

export async function getAuthConfig() {

  return {
    callbacks: {
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        const isOnApp = nextUrl.pathname.startsWith('/app');
        const isOnAdminPage = nextUrl.pathname.startsWith('/app/admin');

        // Protect Admin page
        if (isOnAdminPage && (!isLoggedIn || !auth?.user?.email || !isAdmin(auth?.user?.email))) {
          return Response.redirect(new URL('/', nextUrl))
        }

        // Protect App
        if (isOnApp && !isLoggedIn) {
          return false // Redirect unauthenticated users to login page
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

        if (!WHITELISTED.includes(profile.email)) {
          return false
        }

        return true
      },
      async redirect({ url, baseUrl }) {
        // Ensure the correct redirect URL is used
        return url.startsWith(baseUrl) ? url : baseUrl;
      },
    },
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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