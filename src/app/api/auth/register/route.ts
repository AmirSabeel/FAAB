import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists in User table
    const existingUser = await db.user.findFirst({
      where: { email: { equals: normalizedEmail } },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const hashedPassword = await hash(password, 12)

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'customer',
      },
    })

    // Safely create or update Customer record for backward compatibility
    await db.customer.upsert({
      where: { email: normalizedEmail },
      update: { name: name.trim() },
      create: { name: name.trim(), email: normalizedEmail },
    }).catch(() => {})

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error?.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}