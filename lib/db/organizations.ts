import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type OrganizationSettingType = {
  id: number;
  key: string;
  value: string;
  organization_id: number;
  createdAt: Date;
  updatedAt: Date;
};

export async function createOrganization(data: {
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
}) {
  return prisma.organization.create({
    data,
  });
}

export async function getOrganizationById(id: number) {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      organizationSettings: true,
      evidenceTypes: true,
      customFields: true,
    },
  });
}

export async function updateOrganization(
  id: number,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
  }
) {
  return prisma.organization.update({
    where: { id },
    data,
  });
}

export async function deleteOrganization(id: number) {
  return prisma.organization.delete({
    where: { id },
  });
}

export async function getOrganizationUsers(id: number) {
  return prisma.user.findMany({
    where: { organization_id: id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}

export async function addUserToOrganization(
  organizationId: number,
  userId: number
) {
  return prisma.user.update({
    where: { id: userId },
    data: { organization_id: organizationId },
  });
}

export async function removeUserFromOrganization(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: { organization_id: null },
  });
}

export async function getOrganizationSettings(organization_id: number) {
  try {
    const settings = await prisma.organizationSetting.findMany({
      where: { organization_id }
    });

    return settings.reduce((acc: Record<string, string>, setting: OrganizationSettingType) => ({
      ...acc,
      [setting.key]: setting.value,
    }), {});
  } catch (error) {
    console.error("[GET_ORGANIZATION_SETTINGS]", error);
    return {};
  }
}

export async function updateOrganizationSetting(
  organization_id: number,
  key: string,
  value: string
) {
  return prisma.organizationSetting.upsert({
    where: {
      organization_id_key: {
        organization_id,
        key,
      },
    },
    update: { value },
    create: {
      organization_id,
      key,
      value,
    },
  });
}

export async function deleteOrganizationSetting(
  organization_id: number,
  key: string
) {
  return prisma.organizationSetting.delete({
    where: {
      organization_id_key: {
        organization_id,
        key,
      },
    },
  });
}

// Evidence Type Management
export async function createEvidenceType(
  organization_id: number,
  data: {
    name: string;
    description?: string | null;
  }
) {
  return prisma.evidenceType.create({
    data: {
      ...data,
      organization_id,
    },
  });
}

export async function updateEvidenceType(
  id: number,
  data: {
    name?: string;
    description?: string | null;
  }
) {
  return prisma.evidenceType.update({
    where: { id },
    data,
  });
}

export async function deleteEvidenceType(id: number) {
  return prisma.evidenceType.delete({
    where: { id },
  });
}

// Custom Field Management
export async function createCustomField(
  organization_id: number,
  data: {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    options?: string | null;
  }
) {
  return prisma.customField.create({
    data: {
      ...data,
      organization_id,
    },
  });
}

export async function updateCustomField(
  id: number,
  data: {
    name?: string;
    label?: string;
    type?: string;
    required?: boolean;
    options?: string | null;
  }
) {
  return prisma.customField.update({
    where: { id },
    data,
  });
}

export async function deleteCustomField(id: number) {
  return prisma.customField.delete({
    where: { id },
  });
}
