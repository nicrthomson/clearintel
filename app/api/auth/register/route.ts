import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: "User already exists" }),
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create organization first
    const organization = await prisma.organization.create({
      data: {
        name: `${name || email}'s Organization`,
      },
    })

    // Create user with organization
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        organization_id: organization.id,
      },
    })

    return NextResponse.json({
      success: true,
      userId: user.id,
      organizationId: organization.id,
    })
  } catch (error) {
    console.error("[REGISTER_POST]", error)
    return new NextResponse(
      JSON.stringify({ error: "Registration failed" }),
      { status: 500 }
    )
  }
}
