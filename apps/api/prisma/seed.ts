import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Saúde', icon: '❤️', color: '#ef4444' },
  { name: 'Fitness', icon: '💪', color: '#f97316' },
  { name: 'Produtividade', icon: '🎯', color: '#3b82f6' },
  { name: 'Mindfulness', icon: '🧘', color: '#8b5cf6' },
  { name: 'Educação', icon: '📚', color: '#06b6d4' },
  { name: 'Finanças', icon: '💰', color: '#22c55e' },
  { name: 'Social', icon: '👥', color: '#ec4899' },
  { name: 'Sono', icon: '😴', color: '#6366f1' },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon, color: cat.color },
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
