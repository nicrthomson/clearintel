import { hash, compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { userIncludes } from './types';

interface CreateUserParams {
  email: string;
  password: string;
  name?: string;
  organization_id: number | null;
  role: 'ADMIN' | 'USER';
}

export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
      ...userIncludes,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function validatePassword(user: { password: string }, password: string): Promise<boolean> {
  return compare(password, user.password);
}

export async function createUser(params: CreateUserParams) {
  const hashedPassword = await hash(params.password, 10);
  try {
    return await prisma.user.create({
      data: {
        email: params.email,
        password: hashedPassword,
        name: params.name,
        role: params.role,
        organization: params.organization_id ? {
          connect: {
            id: params.organization_id
          }
        } : undefined,
      },
      ...userIncludes,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
