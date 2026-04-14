import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jeanSuero = await prisma.citizen.upsert({
    where: { cedula: '40212345678' },
    update: {},
    create: {
      cedula: '40212345678',
      fullName: 'JEAN SUERO',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'MALE',
      registrationStatus: 'VERIFIED',
      node: 'NODE-04-DR'
    },
  });

  const jeremySolano = await prisma.citizen.upsert({
    where: { cedula: '40231493301' },
    update: {},
    create: {
      cedula: '40231493301',
      fullName: 'Jerermy Michel Solano Frias',
      dateOfBirth: new Date('1995-12-15'),
      gender: 'MALE',
      registrationStatus: 'VERIFIED',
      node: 'NODE-04-DR'
    },
  });

  console.log({ jeanSuero, jeremySolano });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
