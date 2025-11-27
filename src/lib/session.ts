import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'tradehive_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

/**
 * Create a session for a user and set the session cookie
 */
export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    // Create session in database
    const session = await prisma.session.create({
        data: {
            userId,
            sessionToken: generateSessionToken(),
            expires: expiresAt,
        },
    })

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, session.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    })

    return session
}

/**
 * Get the current session from the cookie
 */
export async function getSession() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (!sessionToken) {
        return null
    }

    // Find session in database
    const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
    })

    // Check if session is expired
    if (!session || session.expires < new Date()) {
        if (session) {
            await prisma.session.delete({ where: { id: session.id } })
        }
        return null
    }

    return session
}

/**
 * Delete the current session (logout)
 */
export async function deleteSession() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    if (sessionToken) {
        // Delete from database
        await prisma.session.deleteMany({
            where: { sessionToken },
        })
    }

    // Clear cookie
    cookieStore.delete(SESSION_COOKIE_NAME)
}

/**
 * Generate a random session token
 */
function generateSessionToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
}
