import { google } from 'googleapis'
import { prisma } from './prisma'

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

/**
 * Generate OAuth URL for company to connect Gmail
 */
export function getGoogleAuthUrl() {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.send'],
        prompt: 'consent', // Force to get refresh token
    })
}

/**
 * Exchange authorization code for tokens and save to company
 */
export async function handleGoogleCallback(code: string, companyId: string) {
    try {
        const { tokens } = await oauth2Client.getToken(code)

        await prisma.company.update({
            where: { id: companyId },
            data: {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token,
                googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                emailConnected: true,
            },
        })

        return { success: true }
    } catch (error) {
        console.error('Error handling Google callback:', error)
        return { success: false, error }
    }
}

/**
 * Refresh access token if expired
 */
async function refreshAccessToken(companyId: string, refreshToken: string) {
    try {
        oauth2Client.setCredentials({ refresh_token: refreshToken })
        const { credentials } = await oauth2Client.refreshAccessToken()

        await prisma.company.update({
            where: { id: companyId },
            data: {
                googleAccessToken: credentials.access_token,
                googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
            },
        })

        return credentials.access_token
    } catch (error) {
        console.error('Error refreshing token:', error)
        throw error
    }
}

/**
 * Send email via Gmail API
 */
export async function sendEmailViaGmail(
    companyId: string,
    to: string,
    subject: string,
    html: string
) {
    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                googleAccessToken: true,
                googleRefreshToken: true,
                googleTokenExpiry: true,
                emailConnected: true,
                email: true,
                name: true,
            },
        })

        if (!company?.emailConnected || !company.googleAccessToken) {
            throw new Error('Gmail not connected for this company')
        }

        // Check if token is expired
        let accessToken = company.googleAccessToken
        if (company.googleTokenExpiry && new Date() >= company.googleTokenExpiry) {
            if (!company.googleRefreshToken) {
                throw new Error('No refresh token available')
            }
            accessToken = await refreshAccessToken(companyId, company.googleRefreshToken as string)
        }

        if (!accessToken) {
            throw new Error('Failed to get access token')
        }

        oauth2Client.setCredentials({ access_token: accessToken })
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

        // Create email message
        const message = [
            `From: ${company.name} <${company.email}>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            html,
        ].join('\n')

        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')

        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        })

        console.log('Email sent via Gmail:', result.data.id)
        return { success: true, messageId: result.data.id }
    } catch (error) {
        console.error('Error sending email via Gmail:', error)
        return { success: false, error }
    }
}

/**
 * Disconnect Gmail for a company
 */
export async function disconnectGmail(companyId: string) {
    await prisma.company.update({
        where: { id: companyId },
        data: {
            googleAccessToken: null,
            googleRefreshToken: null,
            googleTokenExpiry: null,
            emailConnected: false,
        },
    })
}
