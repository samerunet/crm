const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function main() {
  const adminEmail = "admin@fari.makeup";
  const clientEmail = "client@fari.makeup";

  const adminHash = await bcrypt.hash("Admin123!", 10);
  const clientHash = await bcrypt.hash("Client123!", 10);

  // Upsert users
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", name: "Fari Admin", image: null },
    create: { email: adminEmail, role: "ADMIN", name: "Fari Admin", image: null },
  });

  const client = await db.user.upsert({
    where: { email: clientEmail },
    update: { role: "USER", name: "Sample Client", image: null },
    create: { email: clientEmail, role: "USER", name: "Sample Client", image: null },
  });

  // Create SQLite-side table for password hashes if it doesn't exist
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS _Credential (
      userId TEXT PRIMARY KEY,
      passwordHash TEXT NOT NULL
    )
  `);

  // Upsert hashes
  await db.$executeRawUnsafe(
    `INSERT OR REPLACE INTO _Credential (userId, passwordHash) VALUES (?, ?)`,
    admin.id,
    adminHash
  );
  await db.$executeRawUnsafe(
    `INSERT OR REPLACE INTO _Credential (userId, passwordHash) VALUES (?, ?)`,
    client.id,
    clientHash
  );

  console.log("✅ Seeded users:");
  console.log("  ADMIN  -> admin@fari.makeup / Admin123!");
  console.log("  CLIENT -> client@fari.makeup / Client123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
