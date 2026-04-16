import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const SYSTEM_SALT = process.env.BLOCKCHAIN_SALT;
if (!SYSTEM_SALT) {
  throw new Error('[VoteChain Security] BLOCKCHAIN_SALT is missing from environment variables!');
}

function computeHash(index: number, previousHash: string, timestamp: string, data: string, nonce: number): string {
  return crypto.createHash('sha256')
    .update(`${index}${previousHash}${timestamp}${data}${nonce}${SYSTEM_SALT}`)
    .digest('hex');
}

async function main() {
  console.log('🌱 Seeding VoteChain database...');

  // ── Citizens ────────────────────────────────────────────────────────────────
  const jeanSuero = await prisma.citizen.upsert({
    where: { cedula: '40212345678' },
    update: { province: 'Distrito Nacional', municipality: 'Santo Domingo de Guzmán' },
    create: {
      cedula: '40212345678',
      fullName: 'JEAN SUERO',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'MALE',
      registrationStatus: 'VERIFIED',
      node: 'NODE-04-DR',
      province: 'Distrito Nacional',
      municipality: 'Santo Domingo de Guzmán',
    },
  });

  const jeremySolano = await prisma.citizen.upsert({
    where: { cedula: '40231493301' },
    update: { province: 'Santiago', municipality: 'Santiago de los Caballeros' },
    create: {
      cedula: '40231493301',
      fullName: 'Jeremy Michel Solano Frias',
      dateOfBirth: new Date('1995-12-15'),
      gender: 'MALE',
      registrationStatus: 'VERIFIED',
      node: 'NODE-04-DR',
      province: 'Santiago',
      municipality: 'Santiago de los Caballeros',
    },
  });

  console.log('✅ Citizens seeded:', { jeanSuero: jeanSuero.fullName, jeremySolano: jeremySolano.fullName });

  // ── Election Period ──────────────────────────────────────────────────────────
  const period2026 = await prisma.electionPeriod.upsert({
    where: { id: 'period-2026' },
    update: { isActive: true },
    create: { id: 'period-2026', year: 2026, isActive: true },
  });

  console.log('✅ Election period seeded: 2026');

  // ── Elections ────────────────────────────────────────────────────────────────
  const periodStart = new Date('2026-01-01T00:00:00.000Z');
  const periodEnd   = new Date('2026-12-31T23:59:59.000Z');

  const presidentialElection = await prisma.election.upsert({
    where: { id: 'election-2026-presidential' },
    update: {},
    create: {
      id: 'election-2026-presidential',
      type: 'PRESIDENTIAL',
      periodId: period2026.id,
      startDate: periodStart,
      endDate: periodEnd,
    },
  });

  const congressionalElection = await prisma.election.upsert({
    where: { id: 'election-2026-congressional' },
    update: {},
    create: {
      id: 'election-2026-congressional',
      type: 'CONGRESSIONAL',
      periodId: period2026.id,
      startDate: periodStart,
      endDate: periodEnd,
    },
  });

  const municipalElection = await prisma.election.upsert({
    where: { id: 'election-2026-municipal' },
    update: {},
    create: {
      id: 'election-2026-municipal',
      type: 'MUNICIPAL',
      periodId: period2026.id,
      startDate: periodStart,
      endDate: periodEnd,
    },
  });

  console.log('✅ Elections seeded: PRESIDENTIAL, CONGRESSIONAL, MUNICIPAL (2026)');

  // ── Candidates: Presidential ─────────────────────────────────────────────────
  const presidentialCandidates = [
    { id: 'pres-elena',      name: 'Elena Martínez Rodríguez',    party: 'Partido Fuerza del Pueblo',          position: 'president' },
    { id: 'pres-carlos',     name: 'Carlos Fernández Medina',      party: 'Partido Reformista Social Cristiano', position: 'president' },
    { id: 'pres-valentina',  name: 'Valentina Cruz Sánchez',       party: 'Partido Revolucionario Moderno',      position: 'president' },
    { id: 'pres-abstencion', name: 'Abstención / Voto en Blanco',  party: 'Voto Nulo',                          position: 'president' },
  ];

  for (const c of presidentialCandidates) {
    await prisma.candidate.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, electionId: presidentialElection.id },
    });
  }

  // ── Candidates: Congressional — Distrito Nacional ────────────────────────────
  const dnCongressional = [
    { id: 'dn-cong-rafael',  name: 'Rafael Díaz Peralta',    party: 'Partido Fuerza del Pueblo',          position: 'senador',  province: 'Distrito Nacional' },
    { id: 'dn-cong-ana',     name: 'Ana Lucía Guerrero',     party: 'Partido Reformista Social Cristiano', position: 'senador',  province: 'Distrito Nacional' },
    { id: 'dn-cong-miguel',  name: 'Miguel Ángel Torres',    party: 'Partido Revolucionario Moderno',      position: 'diputado', province: 'Distrito Nacional' },
    { id: 'dn-cong-sofia',   name: 'Sofía Reyes Castillo',   party: 'Partido Fuerza del Pueblo',          position: 'diputado', province: 'Distrito Nacional' },
    { id: 'dn-cong-luis',    name: 'Luis Enrique Familia',   party: 'Partido Reformista Social Cristiano', position: 'diputado', province: 'Distrito Nacional' },
  ];

  for (const c of dnCongressional) {
    await prisma.candidate.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, electionId: congressionalElection.id },
    });
  }

  // ── Candidates: Congressional — Santiago ──────────────────────────────────────
  const stgCongressional = [
    { id: 'stg-cong-augusto',    name: 'Augusto Ventura Polanco',    party: 'Partido Fuerza del Pueblo',          position: 'senador',  province: 'Santiago' },
    { id: 'stg-cong-delfina',    name: 'Delfina Contreras López',    party: 'Partido Revolucionario Moderno',      position: 'senador',  province: 'Santiago' },
    { id: 'stg-cong-francisco',  name: 'Francisco Javier Belliard',  party: 'Partido Reformista Social Cristiano', position: 'diputado', province: 'Santiago' },
    { id: 'stg-cong-yesenia',    name: 'Yesenia Altagracia Minaya',  party: 'Partido Fuerza del Pueblo',          position: 'diputado', province: 'Santiago' },
  ];

  for (const c of stgCongressional) {
    await prisma.candidate.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, electionId: congressionalElection.id },
    });
  }

  // ── Candidates: Municipal — Distrito Nacional / Santo Domingo de Guzmán ──────
  const dnMunicipal = [
    { id: 'dn-mun-patricia', name: 'Patricia Matos Herrera',       party: 'Partido Revolucionario Moderno',      position: 'mayor',   province: 'Distrito Nacional', municipality: 'Santo Domingo de Guzmán' },
    { id: 'dn-mun-jose',     name: 'José Antonio Núñez',           party: 'Partido Fuerza del Pueblo',          position: 'mayor',   province: 'Distrito Nacional', municipality: 'Santo Domingo de Guzmán' },
    { id: 'dn-mun-maria',    name: 'María Concepción Pérez',       party: 'Partido Reformista Social Cristiano', position: 'regidor', province: 'Distrito Nacional', municipality: 'Santo Domingo de Guzmán' },
    { id: 'dn-mun-ramon',    name: 'Ramón Bienvenido Rosa',        party: 'Partido Revolucionario Moderno',      position: 'regidor', province: 'Distrito Nacional', municipality: 'Santo Domingo de Guzmán' },
    { id: 'dn-mun-carmen',   name: 'Carmen Altagracia Suárez',     party: 'Partido Fuerza del Pueblo',          position: 'regidor', province: 'Distrito Nacional', municipality: 'Santo Domingo de Guzmán' },
    { id: 'dn-mun-victor',   name: 'Víctor Alexis Pereyra',        party: 'Partido Reformista Social Cristiano', position: 'regidor', province: 'Distrito Nacional', municipality: 'Santo Domingo de Guzmán' },
  ];

  for (const c of dnMunicipal) {
    await prisma.candidate.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, electionId: municipalElection.id },
    });
  }

  // ── Candidates: Municipal — Santiago / Santiago de los Caballeros ─────────────
  const stgMunicipal = [
    { id: 'stg-mun-guillermo', name: 'Guillermo Morales Báez',    party: 'Partido Revolucionario Moderno',      position: 'mayor',   province: 'Santiago', municipality: 'Santiago de los Caballeros' },
    { id: 'stg-mun-sara',      name: 'Sara Isabel Caminero',      party: 'Partido Fuerza del Pueblo',          position: 'mayor',   province: 'Santiago', municipality: 'Santiago de los Caballeros' },
    { id: 'stg-mun-nelson',    name: 'Nelson Armando Taveras',    party: 'Partido Reformista Social Cristiano', position: 'regidor', province: 'Santiago', municipality: 'Santiago de los Caballeros' },
    { id: 'stg-mun-luisa',     name: 'Luisa María Comprés',       party: 'Partido Revolucionario Moderno',      position: 'regidor', province: 'Santiago', municipality: 'Santiago de los Caballeros' },
    { id: 'stg-mun-freddy',    name: 'Freddy Antonio Rodríguez',  party: 'Partido Fuerza del Pueblo',          position: 'regidor', province: 'Santiago', municipality: 'Santiago de los Caballeros' },
  ];

  for (const c of stgMunicipal) {
    await prisma.candidate.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, electionId: municipalElection.id },
    });
  }

  console.log('✅ Candidates seeded across all elections');

  // ── Genesis Block ────────────────────────────────────────────────────────────
  const existingGenesis = await prisma.block.findUnique({ where: { index: 0 } });
  if (!existingGenesis) {
    const timestamp  = new Date('2026-01-01T00:00:00.000Z');
    const data       = 'GENESIS';
    const prevHash   = '0'.repeat(64);
    let nonce = 0, hash = '';
    while (true) {
      hash = computeHash(0, prevHash, timestamp.toISOString(), data, nonce);
      if (hash.startsWith('000')) break;
      nonce++;
    }
    await prisma.block.create({ data: { index: 0, timestamp, data, previousHash: prevHash, hash, nonce } });
    console.log('✅ Genesis block created:', hash.substring(0, 20) + '...');
  } else {
    console.log('ℹ️  Genesis block already exists, skipping');
  }

  console.log('🎉 Seeding complete!');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
