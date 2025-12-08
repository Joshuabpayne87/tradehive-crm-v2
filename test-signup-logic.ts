
import { prisma } from './src/lib/prisma'
import * as z from 'zod'
import bcrypt from 'bcryptjs'

const signupSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
})

async function testSignup() {
    try {
        console.log('Starting test signup...')

        const body = {
            companyName: 'Test Company ' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            password: 'password123',
            name: 'Test User'
        }

        const result = signupSchema.safeParse(body)

        if (!result.success) {
            console.error('Validation failed:', result.error)
            return
        }

        console.log('Validation passed')

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: result.data.email },
        })

        if (existingUser) {
            console.log('User already exists')
            return
        }

        console.log('Hashing password...')
        const hashedPassword = await bcrypt.hash(result.data.password, 10)
        console.log('Password hashed')

        console.log('Starting transaction...')
        const { company, user } = await prisma.$transaction(async (tx) => {
            // Create Company
            const company = await tx.company.create({
                data: {
                    name: result.data.companyName,
                    email: result.data.email,
                }
            })
            console.log('Company created:', company.id)

            // Create User with hashed password
            const user = await tx.user.create({
                data: {
                    email: result.data.email,
                    name: result.data.name,
                    password: hashedPassword,
                    role: 'owner',
                    companyId: company.id,
                }
            })
            console.log('User created:', user.id)

            return { company, user }
        })

        console.log('Transaction successful')

        // Mock createSession
        console.log('Skipping createSession (Next.js specific)')

        console.log('Test completed successfully')

    } catch (error: any) {
        console.error('Test failed:', error)
        console.error(error.stack)
    } finally {
        await prisma.$disconnect()
    }
}

testSignup()
