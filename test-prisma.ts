const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Test a simple query
  const actions = await prisma.caseAction.findMany()
  console.log('Actions:', actions)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
