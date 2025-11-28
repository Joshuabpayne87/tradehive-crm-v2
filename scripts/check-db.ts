
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Checking database connection...')
    try {
        const userCount = await prisma.user.count()
        console.log(`✅ Connected! Found ${userCount} users.`)

        const users = await prisma.user.findMany({
            take: 5,
            select: { id: true, email: true, role: true }
        })
        console.log('Sample users:', users)

    } catch (error) {
        console.error('❌ Database connection failed:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
