/**
 * Migration script to set passwords for existing users
 * Run this with: npx tsx scripts/set-user-passwords.ts
 */

import { PrismaClient } from '../src/generated/prisma/client/index.js'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking for users without passwords...\n')

    // Find all users without passwords
    const usersWithoutPasswords = await prisma.user.findMany({
        where: {
            password: null,
        },
        select: {
            id: true,
            email: true,
            name: true,
        },
    })

    if (usersWithoutPasswords.length === 0) {
        console.log('✅ All users have passwords set!')
        return
    }

    console.log(`Found ${usersWithoutPasswords.length} user(s) without passwords:\n`)
    usersWithoutPasswords.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`)
    })

    console.log('\n📝 Setting default password "password123" for all users...\n')

    const hashedPassword = await bcrypt.hash('password123', 10)

    // Update all users without passwords
    const result = await prisma.user.updateMany({
        where: {
            password: null,
        },
        data: {
            password: hashedPassword,
        },
    })

    console.log(`✅ Updated ${result.count} user(s)`)
    console.log('\n⚠️  Default password: password123')
    console.log('   Please ask users to change their passwords after logging in.\n')
}

main()
    .catch((error) => {
        console.error('❌ Error:', error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
