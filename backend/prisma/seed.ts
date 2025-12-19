import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Začínám seedování databáze...');

  // Vytvoření uživatelů
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  const organizerPassword = await bcrypt.hash('organizer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Administrátor',
      role: 'ADMIN',
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      email: 'organizer@example.com',
      password: organizerPassword,
      firstName: 'Petr',
      lastName: 'Organizátor',
      role: 'ORGANIZER',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'Jana',
      lastName: 'Nováková',
      role: 'USER',
    },
  });

  console.log('✅ Uživatelé vytvořeni');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Organizátor: organizer@example.com / organizer123');
  console.log('   Uživatel: user@example.com / user123');

  // Vytvoření akcí
  const events = [
    {
      title: 'Studentský ples 2025',
      description: 'Tradiční studentský ples s hudbou, tancem a skvělou atmosférou. Dress code: formální.',
      location: 'Kongresové centrum Praha',
      startDate: new Date('2025-03-15T19:00:00'),
      endDate: new Date('2025-03-16T02:00:00'),
      category: 'Party',
      ticketPrice: 350,
      totalTickets: 500,
      availableTickets: 500,
      status: 'PUBLISHED',
      organizerId: organizer.id,
    },
    {
      title: 'Přednáška: Umělá inteligence v praxi',
      description: 'Zajímavá přednáška o praktickém využití AI a strojového učení v moderních aplikacích.',
      location: 'VŠE Praha, místnost 234',
      startDate: new Date('2025-01-20T16:00:00'),
      endDate: new Date('2025-01-20T18:00:00'),
      category: 'Technologie',
      ticketPrice: 0,
      totalTickets: 100,
      availableTickets: 100,
      status: 'PUBLISHED',
      organizerId: organizer.id,
    },
    {
      title: 'Filmový večer: Klasika sci-fi',
      description: 'Promítání kultovních sci-fi filmů s diskuzí. Občerstvení v ceně vstupenky.',
      location: 'Studentský klub Menza',
      startDate: new Date('2025-02-05T18:00:00'),
      endDate: new Date('2025-02-05T23:00:00'),
      category: 'Film',
      ticketPrice: 80,
      totalTickets: 60,
      availableTickets: 60,
      status: 'PUBLISHED',
      organizerId: organizer.id,
    },
    {
      title: 'Hackathon: Code for Good',
      description: '24hodinový hackathon zaměřený na tvorbu aplikací s pozitivním dopadem na společnost.',
      location: 'TechHub Praha',
      startDate: new Date('2025-02-20T10:00:00'),
      endDate: new Date('2025-02-21T10:00:00'),
      category: 'Technologie',
      ticketPrice: 150,
      totalTickets: 80,
      availableTickets: 80,
      status: 'PUBLISHED',
      organizerId: organizer.id,
    },
    {
      title: 'Sportovní turnaj: Stolní fotbal',
      description: 'Turnaj ve stolním fotbale pro studenty. Ceny pro nejlepší týmy!',
      location: 'Sportovní centrum UK',
      startDate: new Date('2025-01-25T14:00:00'),
      endDate: new Date('2025-01-25T20:00:00'),
      category: 'Sport',
      ticketPrice: 0,
      totalTickets: 50,
      availableTickets: 50,
      status: 'PUBLISHED',
      organizerId: organizer.id,
    },
    {
      title: 'Open Mic Night',
      description: 'Otevřené pódium pro muzikanty, básníky a stand-up komiky. Přijď si zazpívat nebo poslechnout!',
      location: 'Café Práh',
      startDate: new Date('2025-01-18T19:00:00'),
      endDate: new Date('2025-01-18T23:00:00'),
      category: 'Hudba',
      ticketPrice: 50,
      totalTickets: 40,
      availableTickets: 40,
      status: 'PUBLISHED',
      organizerId: admin.id,
    },
  ];

  for (const eventData of events) {
    await prisma.event.create({ data: eventData });
  }

  console.log(`✅ Vytvořeno ${events.length} akcí`);

  console.log('\n🎉 Seedování dokončeno!');
  console.log('\n📝 Můžeš se přihlásit jako:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   Organizátor: organizer@example.com / organizer123');
  console.log('   Uživatel: user@example.com / user123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Chyba při seedování:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
