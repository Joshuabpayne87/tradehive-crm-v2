
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2] || 'test@example.com'
    const password = process.argv[3] || 'password123'
    const name = 'Test User'

    console.log(`Creating user: ${email}`)

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        // Check if company exists, if not create one
        let company = await prisma.company.findFirst()
        if (!company) {
            console.log('Creating default company...')
            company = await prisma.company.create({
                data: {
                    name: 'Test Company',
                    email: 'company@example.com'
                }
            })
        }

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                companyId: company.id
            },
            create: {
                email,
                name,
                password: hashedPassword,
                companyId: company.id,
                role: 'owner'
            },
        })

        console.log(`✅ User created/updated: ${user.email}`)
        console.log(`Password: ${password}`)

    } catch (error) {
        console.error('❌ Error creating user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
