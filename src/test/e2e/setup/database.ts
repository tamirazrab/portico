import { PrismaClient } from "@/generated/prisma/client";

/**
 * Test database utilities for E2E tests.
 * Provides isolated, resettable database state for each test.
 */

let testDb: PrismaClient | null = null;

/**
 * Get or create test database client.
 * Uses separate test database to avoid conflicts with development database.
 */
export function getTestDatabase(): PrismaClient {
  if (!testDb) {
    const databaseUrl = process.env.TEST_DATABASE_URL ||
      "postgresql://test_user:test_password@localhost:5433/portico_test";

    testDb = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }
  return testDb;
}

/**
 * Reset test database by truncating all tables.
 * This ensures test isolation and prevents test pollution.
 */
export async function resetTestDatabase(): Promise<void> {
  const db = getTestDatabase();

  // Get all table names
  const tables = await db.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public'
  `;

  // Truncate all tables (CASCADE to handle foreign keys)
  await db.$executeRawUnsafe(
    `TRUNCATE TABLE ${tables.map(t => `"${t.tablename}"`).join(", ")} CASCADE`
  );
}

/**
 * Seed test database with minimal required data.
 * This should include test users, base configurations, etc.
 */
export async function seedTestDatabase(): Promise<void> {
  const _db = getTestDatabase();

  // Add test user seeding here
  // For now, this is a placeholder - will be implemented with Better Auth test users
}

/**
 * Close test database connection.
 * Should be called in test teardown.
 */
export async function closeTestDatabase(): Promise<void> {
  if (testDb) {
    await testDb.$disconnect();
    testDb = null;
  }
}

