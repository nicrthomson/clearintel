import { PrismaClient } from '@prisma/client'
import { defaultHTMLTemplate } from '../app/api/reports/templates/default.ts'

const prisma = new PrismaClient()

async function updateDefaultTemplate() {
  try {
    const template = await prisma.reportTemplate.findFirst({
      where: {
        name: "Default HTML Template"
      }
    });

    if (!template) {
      console.log('Creating new template...');
      await prisma.reportTemplate.create({
        data: {
          name: "Default HTML Template",
          description: defaultHTMLTemplate.description,
          sections: defaultHTMLTemplate.sections,
          type: defaultHTMLTemplate.type,
          category: defaultHTMLTemplate.category,
          metadata: defaultHTMLTemplate.metadata,
        }
      });
    } else {
      console.log('Updating existing template...');
      await prisma.reportTemplate.update({
        where: {
          id: template.id
        },
        data: {
          sections: defaultHTMLTemplate.sections,
          metadata: defaultHTMLTemplate.metadata,
        }
      });
    }
    
    console.log('Template operation completed successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDefaultTemplate();