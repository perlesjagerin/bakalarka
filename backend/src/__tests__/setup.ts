import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Setup pro Jest testy
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

// KRITICKÉ: Zajistíme, že testy NIKDY nepoužijí produkční databázi
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || !dbUrl.includes('_test')) {
  console.error('❌ CHYBA: Testy musí používat testovací databázi!');
  console.error(`   Aktuální DB: ${dbUrl || 'není nastavena'}`);
  console.error('   Očekáváno: DATABASE_URL obsahující "_test"');
  console.error('   Spusťte testy přes: npm test');
  process.exit(1);
}

const prisma = new PrismaClient();

// Funkce pro vytvoření testovací databáze
async function setupTestDatabase() {
  try {
    console.log('🔧 Setting up test database...');
    
    // Zkusíme se připojit k testovací databázi
    await prisma.$executeRawUnsafe('SELECT 1');
    console.log('✅ Test database exists');
  } catch (error) {
    console.log('⚠️  Test database does not exist, creating...');
    
    // Připojíme se k postgres databázi a vytvoříme testovací databázi
    const tempPrisma = new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://postgres:postgres@localhost:5432/postgres'
        }
      }
    });
    
    try {
      await tempPrisma.$executeRawUnsafe('CREATE DATABASE ticket_reservation_test');
      console.log('✅ Test database created');
    } catch (createError: any) {
      if (!createError.message.includes('already exists')) {
        console.error('❌ Failed to create test database:', createError.message);
      }
    } finally {
      await tempPrisma.$disconnect();
    }
  }
  
  // Aplikujeme migrace
  try {
    console.log('🔄 Running migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    });
    console.log('✅ Migrations applied');
  } catch (error) {
    console.error('❌ Failed to run migrations:', error);
  }
}

// Setup před všemi testy
beforeAll(async () => {
  console.log('🧪 Starting test suite...');
  await setupTestDatabase();
}, 60000); // 60s timeout pro setup

// Cleanup po všech testech
afterAll(async () => {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Najdeme všechny testovací uživatele (obsahují "test", "events" nebo "example" v emailu)
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { email: { contains: 'events' } },
          { email: { contains: 'example' } }
        ]
      },
      select: { id: true }
    });
    
    const testUserIds = testUsers.map(u => u.id);
    
    if (testUserIds.length > 0) {
      // Smazání dat souvisejících s testovacími uživateli (v obráceném pořadí kvůli foreign keys)
      await prisma.complaint.deleteMany({
        where: { userId: { in: testUserIds } }
      });
      
      await prisma.payment.deleteMany({
        where: {
          reservation: {
            OR: [
              { userId: { in: testUserIds } },
              { event: { organizerId: { in: testUserIds } } }
            ]
          }
        }
      });
      
      await prisma.reservation.deleteMany({
        where: {
          OR: [
            { userId: { in: testUserIds } },
            { event: { organizerId: { in: testUserIds } } }
          ]
        }
      });
      
      await prisma.event.deleteMany({
        where: { organizerId: { in: testUserIds } }
      });
      
      // Nakonec smazání testovacích uživatelů
      await prisma.user.deleteMany({
        where: { id: { in: testUserIds } }
      });
      
      console.log(`✅ Test data cleaned (${testUserIds.length} test users and their data)`);
    } else {
      console.log('✅ No test data to clean');
    }
  } catch (error) {
    console.error('⚠️  Failed to clean test data:', error);
  }
  
  await prisma.$disconnect();
  console.log('✅ Test suite completed');
});
