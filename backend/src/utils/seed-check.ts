import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

/**
 * Zkontroluje, zda databáze obsahuje seed data
 * Pokud ne, automaticky je vytvoří
 */
export async function ensureSeedData() {
  try {
    // Zkontrolujeme, zda existují uživatelé
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('📦 Databáze je prázdná, načítám seed data...');
      
      try {
        execSync('npm run prisma:seed', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log('✅ Seed data úspěšně načtena!');
      } catch (error) {
        console.error('❌ Chyba při načítání seed dat:', error);
      }
    } else {
      console.log(`✅ Databáze obsahuje ${userCount} uživatelů`);
    }
  } catch (error) {
    console.error('⚠️  Nepodařilo se zkontrolovat databázi:', error);
  } finally {
    await prisma.$disconnect();
  }
}
