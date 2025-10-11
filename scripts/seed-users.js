// scripts/seed-users.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: "admin@fari.makeup",
      name: "Fari Admin",
      role: "ADMIN",
      password: "Admin!123",
    },
    {
      email: "client@fari.makeup",
      name: "Fari Client",
      role: "USER",
      password: "Client!123",
    },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: {
        name: u.name,
        role: u.role,
        passwordHash: hash,
      },
      create: {
        email: u.email.toLowerCase(),
        name: u.name,
        role: u.role,
        passwordHash: hash,
      },
    });
  }

  console.log("Seeded users:");
  console.log(
    users.map(({ email, role, password }) => ({ email, role, password }))
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
