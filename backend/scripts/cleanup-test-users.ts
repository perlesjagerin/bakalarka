import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTestUsers() {
  try {
    console.log('🧹 Čištění testovacích uživatelů z produkční databáze...');
    
    // Najdeme všechny testovací uživatele
    const testUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { email: { contains: 'events' } },
          { email: { contains: 'example' } },
          { email: { endsWith: '@test.com' } },
          { email: { endsWith: '@example.com' } }
        ]
      },
      select: { id: true, email: true, createdAt: true }
    });
    
    if (testUsers.length === 0) {
      console.log('✅ Žádní testovací uživatelé nebyli nalezeni');
      await prisma.$disconnect();
      return;
    }
    
    console.log(`⚠️  Nalezeno ${testUsers.length} testovacích uživatelů:`);
    testUsers.forEach(user => {
      console.log(`   - ${user.email} (vytvořen: ${user.createdAt.toLocaleDateString('cs-CZ')})`);
    });
    
    console.log('\n⚠️  VAROVÁNÍ: Tato operace smaže všechny testovací uživatele a jejich data!');
    console.log('⚠️  Pokračujte pouze pokud jste si jisti, že chcete smazat tato data.\n');
    
    // Pro bezpečnost vyžadujeme potvrzení
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Opravdu chcete smazat testovací uživatele? (ano/ne): ', async (answer: string) => {
      if (answer.toLowerCase() !== 'ano') {
        console.log('❌ Operace zrušena');
        rl.close();
        await prisma.$disconnect();
        return;
      }
      
      const testUserIds = testUsers.map(u => u.id);
      
      // Smazání dat souvisejících s testovacími uživateli
      console.log('🗑️  Mazání stížností...');
      const deletedComplaints = await prisma.complaint.deleteMany({
        where: { userId: { in: testUserIds } }
      });
      console.log(`   Smazáno: ${deletedComplaints.count}`);
      
      console.log('🗑️  Mazání plateb...');
      const deletedPayments = await prisma.payment.deleteMany({
        where: {
          reservation: {
            OR: [
              { userId: { in: testUserIds } },
              { event: { organizerId: { in: testUserIds } } }
            ]
          }
        }
      });
      console.log(`   Smazáno: ${deletedPayments.count}`);
      
      console.log('🗑️  Mazání rezervací...');
      const deletedReservations = await prisma.reservation.deleteMany({
        where: {
          OR: [
            { userId: { in: testUserIds } },
            { event: { organizerId: { in: testUserIds } } }
          ]
        }
      });
      console.log(`   Smazáno: ${deletedReservations.count}`);
      
      console.log('🗑️  Mazání událostí...');
      const deletedEvents = await prisma.event.deleteMany({
        where: { organizerId: { in: testUserIds } }
      });
      console.log(`   Smazáno: ${deletedEvents.count}`);
      
      console.log('🗑️  Mazání uživatelů...');
      const deletedUsers = await prisma.user.deleteMany({
        where: { id: { in: testUserIds } }
      });
      console.log(`   Smazáno: ${deletedUsers.count}`);
      
      console.log(`\n✅ Úspěšně vyčištěno ${deletedUsers.count} testovacích uživatelů a jejich data`);
      
      rl.close();
      await prisma.$disconnect();
    });
    
  } catch (error) {
    console.error('❌ Chyba při čištění testovacích uživatelů:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

cleanupTestUsers();
