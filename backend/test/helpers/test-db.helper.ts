import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export const getTestDb = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
};

export const cleanDatabase = async (): Promise<void> => {
  const db = getTestDb();

  // Delete in correct order to respect foreign key constraints
  await db.analyticsEvent.deleteMany();
  await db.subscription.deleteMany();
  await db.monetizationPlan.deleteMany();
  await db.streamAd.deleteMany();
  await db.episode.deleteMany();
  await db.podcast.deleteMany();
  await db.track.deleteMany();
  await db.playlist.deleteMany();
  await db.hlsSegment.deleteMany();
  await db.upload.deleteMany();
  await db.stream.deleteMany();
  await db.refreshToken.deleteMany();
  await db.passwordReset.deleteMany();
  await db.user.deleteMany();
};

export const closeTestDb = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
  }
};

export const resetDatabase = async (): Promise<void> => {
  await cleanDatabase();
};
