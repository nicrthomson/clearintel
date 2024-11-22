import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { organization: true }
    });

    if (!user?.organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    return NextResponse.json(user.organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        ...data,
        users: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    // Update user with organization and make them org admin
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        organization_id: organization.id,
        isOrgAdmin: true,
      },
    });

    // Create default QA templates
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin');
      const response = await fetch(`${baseUrl}/api/templates/qa/create-defaults`, {
        method: 'POST',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      });

      if (!response.ok) {
        console.error('Failed to create default QA templates:', await response.text());
      }
    } catch (error) {
      console.error('Error creating default QA templates:', error);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        resourceType: 'Organization',
        resourceId: organization.id.toString(),
        details: { data },
        user_id: session.user.id,
        organization_id: organization.id
      }
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        isOrgAdmin: true,
        organization: {
          select: {
            id: true
          }
        }
      }
    });

    if (!user?.organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    if (!user.isOrgAdmin) {
      return new NextResponse('Forbidden - Only organization admins can update organization details', { status: 403 });
    }

    const data = await request.json();

    // Validate domain format
    if (data.domain) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z0-9-.]+$/;
      if (!domainRegex.test(data.domain)) {
        return new NextResponse('Invalid domain format', { status: 400 });
      }
    }

    // Validate subdomain format
    if (data.subdomain) {
      const subdomainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*$/;
      if (!subdomainRegex.test(data.subdomain)) {
        return new NextResponse('Invalid subdomain format', { status: 400 });
      }
    }

    // Check if domain/subdomain is already taken
    const existingOrg = await prisma.organization.findFirst({
      where: {
        AND: [
          {
            OR: [
              data.domain ? { domain: data.domain } : {},
              data.subdomain ? { subdomain: data.subdomain } : {}
            ]
          },
          {
            NOT: {
              id: user.organization.id
            }
          }
        ]
      }
    });

    if (existingOrg) {
      return new NextResponse('Domain or subdomain already in use', { status: 400 });
    }

    const updateData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      website: data.website,
      address: data.address,
      city: data.city,
      state: data.state,
      zipcode: data.zipcode,
      ...(data.domain && { domain: data.domain }),
      ...(data.subdomain && { subdomain: data.subdomain })
    };

    const updatedOrganization = await prisma.organization.update({
      where: { id: user.organization.id },
      data: updateData
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        resourceType: 'Organization',
        resourceId: updatedOrganization.id.toString(),
        details: { changes: updateData },
        user_id: user.id,
        organization_id: updatedOrganization.id
      }
    });

    return NextResponse.json(updatedOrganization);
  } catch (error) {
    console.error('Error updating organization:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
