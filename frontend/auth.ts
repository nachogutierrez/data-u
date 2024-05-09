import NextAuth, { NextAuthResult } from 'next-auth';
import { getAuthConfig } from './auth.config';

let nextAuthResult: NextAuthResult

export async function getNextAuth() {
    if (!nextAuthResult) {
        nextAuthResult = NextAuth(await getAuthConfig())
    }

    return nextAuthResult
}