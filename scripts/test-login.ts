
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2] || 'test@example.com' // Default or pass as arg
    const password = process.argv[3] || 'password123'

    console.log(`Testing login for email: ${email}`)

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { company: true },
        })

        if (!user) {
            console.log('❌ User not found')
            return
        }

        console.log('✅ User found:', { id: user.id, email: user.email, hasPassword: !!user.password })

        if (!user.password) {
            console.log('❌ User has no password set')
            return
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (isPasswordValid) {
            console.log('✅ Password is valid')
        } else {
            console.log('❌ Password is invalid')
            // Optional: Log hash for debugging (be careful with real data)
            // console.log('Stored hash:', user.password)
        }

    } catch (error) {
        console.error('❌ Error during login test:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
