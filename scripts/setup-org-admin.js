const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

// Import defaultQATemplates from the CommonJS module
const { defaultQATemplates } = require('../lib/defaultQATemplates.js');

async function verifyTemplates(organizationId) {
  console.log('\nVerifying templates in database...');
  
  const templates = await prisma.qATemplate.findMany({
    where: {
      organization_id: organizationId,
    },
    include: {
      checklistItems: true,
    },
  });

  console.log(`Found ${templates.length} templates in database:`);
  templates.forEach(template => {
    console.log(`- ${template.name} (${template.type})`);
    console.log(`  Items: ${template.checklistItems.length}`);
    template.checklistItems.forEach(item => {
      console.log(`    - ${item.name} (${item.category})`);
    });
  });

  return templates;
}

async function createDefaultTemplates(organizationId, userId) {
  console.log('\nCreating default QA templates...');
  console.log('Organization ID:', organizationId);
  console.log('User ID:', userId);
  
  try {
    // First, delete any existing templates for this organization
    const deletedItems = await prisma.qAChecklistItem.deleteMany({
      where: {
        organization_id: organizationId,
      },
    });
    console.log(`Deleted ${deletedItems.count} existing checklist items`);

    const deletedTemplates = await prisma.qATemplate.deleteMany({
      where: {
        organization_id: organizationId,
      },
    });
    console.log(`Deleted ${deletedTemplates.count} existing templates`);

    // Get the organization to verify it exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error(`Organization with ID ${organizationId} not found`);
    }

    console.log('Creating templates for organization:', organization.name);
    console.log('Templates to create:', Object.keys(defaultQATemplates));

    for (const [caseType, template] of Object.entries(defaultQATemplates)) {
      console.log(`\nProcessing template for ${caseType}...`);
      
      try {
        // Create template
        const createdTemplate = await prisma.qATemplate.create({
          data: {
            name: template.name,
            type: template.type,
            organization_id: organizationId,
          },
        });

        console.log(`Created template: ${createdTemplate.name} (ID: ${createdTemplate.id})`);

        // Create checklist items for the template
        const items = await prisma.qAChecklistItem.createMany({
          data: template.checklistItems.map((item, index) => ({
            name: item.name,
            description: item.description || null,
            category: item.category,
            required: item.required || false,
            order: item.order,
            organization_id: organizationId,
            template_id: createdTemplate.id,
          })),
        });

        console.log(`Created ${items.count} checklist items for ${caseType}`);

        // Verify the items were created
        const verifyItems = await prisma.qAChecklistItem.findMany({
          where: {
            template_id: createdTemplate.id,
            organization_id: organizationId,
          },
        });
        console.log(`Verified ${verifyItems.length} items exist for template ${createdTemplate.id}`);
      } catch (templateError) {
        console.error(`Error creating template for ${caseType}:`, templateError);
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        resourceType: 'QATemplate',
        resourceId: 'default-templates',
        details: { message: 'Created default QA templates' },
        user_id: userId,
        organization_id: organizationId
      }
    });

    // Final verification
    await verifyTemplates(organizationId);

    console.log('\nDefault QA templates created successfully');
  } catch (error) {
    console.error('Error creating default QA templates:', error);
    throw error;
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const ORGANIZATION_ID = 1; // Always use organization ID 1

  if (!email || !password) {
    console.error('Please provide ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
    process.exit(1);
  }

  try {
    console.log('Starting QA template setup...');

    // Get or create organization with ID 1
    let organization = await prisma.organization.findUnique({
      where: { id: ORGANIZATION_ID },
    });

    if (!organization) {
      // Try to create the organization
      try {
        organization = await prisma.organization.create({
          data: {
            id: ORGANIZATION_ID,
            name: 'Clear Intel',
            subscription: 'ENTERPRISE',
            maxUsers: 5,
            maxReadOnlyUsers: 20,
          },
        });
      } catch (error) {
        console.error('Failed to create organization:', error);
        process.exit(1);
      }
    }

    console.log('Organization:', organization.name);
    console.log('Organization ID:', organization.id);

    // Create or get admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        isOrgAdmin: true,
        role: 'ADMIN',
        organization_id: ORGANIZATION_ID,
      },
      create: {
        email,
        password: hashedPassword,
        name: 'System Admin',
        isOrgAdmin: true,
        role: 'ADMIN',
        organization_id: ORGANIZATION_ID,
      },
    });

    console.log('Admin user:', user.email);
    console.log('User ID:', user.id);

    // Create default QA templates
    await createDefaultTemplates(ORGANIZATION_ID, user.id);

    console.log('\nQA templates setup completed successfully');
    console.log('Organization:', organization.name);
    console.log('Organization ID:', organization.id);
    console.log('Admin user:', user.email);
    console.log('Default QA templates have been created');
  } catch (error) {
    console.error('Error setting up QA templates:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
