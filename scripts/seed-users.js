#!/usr/bin/env node
/* eslint-disable no-console */
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  {
    email: 'admin@crm.local',
    name: 'CRM Admin',
    role: 'ADMIN',
    password: 'Admin123!',
  },
  {
    email: 'manager@crm.local',
    name: 'CRM Manager',
    role: 'MANAGER',
    password: 'Manager123!',
  },
  {
    email: 'client@crm.local',
    name: 'CRM Client',
    role: 'USER',
    password: 'Client123!',
  },
];

async function main() {
  console.log('Seeding CRM users...');
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
      },
    });
    console.log(`  - ${user.email} (${user.role}) seeded`);
  }
  console.log('Done.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error('Seeding failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
