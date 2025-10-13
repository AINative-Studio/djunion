/**
 * DJ Union - Database Seed Script
 * Creates initial development data for testing
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================================================
  // 1. CREATE USERS
  // ============================================================================
  console.log('Creating users...');

  const adminPassword = await bcrypt.hash('AdminPass123!', 12);
  const djPassword = await bcrypt.hash('DJPass123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@djunion.com' },
    update: {},
    create: {
      email: 'admin@djunion.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });

  const dj1 = await prisma.user.upsert({
    where: { email: 'dj@djunion.com' },
    update: {},
    create: {
      email: 'dj@djunion.com',
      passwordHash: djPassword,
      name: 'DJ Example',
      role: 'dj',
    },
  });

  const dj2 = await prisma.user.upsert({
    where: { email: 'techno.dj@djunion.com' },
    update: {},
    create: {
      email: 'techno.dj@djunion.com',
      passwordHash: djPassword,
      name: 'Techno DJ',
      role: 'dj',
    },
  });

  console.log(`✓ Created ${3} users`);

  // ============================================================================
  // 2. CREATE LIVE STREAMS
  // ============================================================================
  console.log('Creating live streams...');

  const stream1 = await prisma.stream.create({
    data: {
      userId: dj1.userId,
      name: 'Live House Mix',
      shoutcastUrl: 'http://stream.example.com:8000',
      mount: '/live',
      streamKeyEnc: 'encrypted_key_placeholder_123',
      genre: 'House',
      description: 'Live house music 24/7 with weekly guest DJs',
      visibility: 'public',
      monetizationEnabled: true,
      enabled: true,
    },
  });

  const stream2 = await prisma.stream.create({
    data: {
      userId: dj2.userId,
      name: 'Underground Techno',
      shoutcastUrl: 'http://stream.example.com:8001',
      mount: '/techno',
      streamKeyEnc: 'encrypted_key_placeholder_456',
      genre: 'Techno',
      description: 'Dark underground techno from Berlin',
      visibility: 'public',
      monetizationEnabled: false,
      enabled: true,
    },
  });

  console.log(`✓ Created ${2} streams`);

  // ============================================================================
  // 3. CREATE STREAM ADS
  // ============================================================================
  console.log('Creating stream ad markers...');

  await prisma.streamAd.createMany({
    data: [
      {
        streamId: stream1.streamId,
        positionSeconds: 0,
        durationSeconds: 30,
        adType: 'pre_roll',
      },
      {
        streamId: stream1.streamId,
        positionSeconds: 1800,
        durationSeconds: 15,
        adType: 'mid_roll',
      },
    ],
  });

  console.log('✓ Created ad markers');

  // ============================================================================
  // 4. CREATE UPLOADS
  // ============================================================================
  console.log('Creating audio uploads...');

  const upload1 = await prisma.upload.create({
    data: {
      userId: dj1.userId,
      filePath: `uploads/audio/${dj1.userId}/upload-001/original.mp3`,
      status: 'ready',
      title: 'Summer Vibes Mix',
      artist: 'DJ Example',
      completedAt: new Date(),
    },
  });

  const upload2 = await prisma.upload.create({
    data: {
      userId: dj1.userId,
      filePath: `uploads/audio/${dj1.userId}/upload-002/original.mp3`,
      status: 'ready',
      title: 'Sunset Sessions',
      artist: 'DJ Example',
      completedAt: new Date(),
    },
  });

  const upload3 = await prisma.upload.create({
    data: {
      userId: dj2.userId,
      filePath: `uploads/audio/${dj2.userId}/upload-003/original.mp3`,
      status: 'processing',
      title: 'Berlin After Hours',
      artist: 'Techno DJ',
    },
  });

  console.log(`✓ Created ${3} uploads`);

  // ============================================================================
  // 5. CREATE HLS SEGMENTS
  // ============================================================================
  console.log('Creating HLS segments...');

  await prisma.hlsSegment.createMany({
    data: [
      {
        uploadId: upload1.uploadId,
        sequenceIndex: 0,
        tsPath: `uploads/audio/${upload1.uploadId}/hls/segment000.ts`,
        durationSeconds: 6.0,
      },
      {
        uploadId: upload1.uploadId,
        sequenceIndex: 1,
        tsPath: `uploads/audio/${upload1.uploadId}/hls/segment001.ts`,
        durationSeconds: 6.0,
      },
      {
        uploadId: upload1.uploadId,
        sequenceIndex: 2,
        tsPath: `uploads/audio/${upload1.uploadId}/hls/segment002.ts`,
        durationSeconds: 6.0,
      },
    ],
  });

  console.log('✓ Created HLS segments');

  // ============================================================================
  // 6. CREATE PLAYLISTS
  // ============================================================================
  console.log('Creating playlists...');

  const playlist1 = await prisma.playlist.create({
    data: {
      userId: dj1.userId,
      title: 'Chill House Collection',
      description: 'Perfect for afternoon listening',
      visibility: 'public',
      monetizationEnabled: false,
    },
  });

  const playlist2 = await prisma.playlist.create({
    data: {
      userId: dj2.userId,
      title: 'Techno Classics',
      description: 'Timeless techno tracks',
      visibility: 'public',
      monetizationEnabled: true,
    },
  });

  console.log(`✓ Created ${2} playlists`);

  // ============================================================================
  // 7. CREATE TRACKS
  // ============================================================================
  console.log('Creating tracks...');

  await prisma.track.createMany({
    data: [
      {
        playlistId: playlist1.playlistId,
        sourceType: 'upload',
        uploadId: upload1.uploadId,
        title: 'Summer Vibes Mix',
        artist: 'DJ Example',
        durationSeconds: 3600,
      },
      {
        playlistId: playlist1.playlistId,
        sourceType: 'upload',
        uploadId: upload2.uploadId,
        title: 'Sunset Sessions',
        artist: 'DJ Example',
        durationSeconds: 2700,
      },
      {
        playlistId: playlist1.playlistId,
        sourceType: 'external',
        url: 'https://example.com/tracks/ambient-mix.mp3',
        title: 'Ambient Chill',
        artist: 'Various Artists',
        durationSeconds: 1800,
      },
    ],
  });

  console.log('✓ Created tracks');

  // ============================================================================
  // 8. CREATE PODCASTS
  // ============================================================================
  console.log('Creating podcasts...');

  const podcast1 = await prisma.podcast.create({
    data: {
      userId: dj1.userId,
      title: 'DJ Union Podcast',
      description: 'Weekly interviews with top DJs and producers',
      language: 'en-us',
      author: 'DJ Example',
      imageUrl: 'https://cdn.djunion.com/images/podcast-cover.jpg',
      explicit: false,
      monetizationEnabled: true,
    },
  });

  const podcast2 = await prisma.podcast.create({
    data: {
      userId: dj2.userId,
      title: 'Techno Talk',
      description: 'Deep dives into techno history and culture',
      language: 'en-us',
      author: 'Techno DJ',
      imageUrl: 'https://cdn.djunion.com/images/techno-podcast.jpg',
      explicit: false,
      customDomain: 'podcast.techno-dj.com',
      monetizationEnabled: false,
    },
  });

  console.log(`✓ Created ${2} podcasts`);

  // ============================================================================
  // 9. CREATE EPISODES
  // ============================================================================
  console.log('Creating episodes...');

  await prisma.episode.createMany({
    data: [
      {
        podcastId: podcast1.podcastId,
        sourceType: 'upload',
        uploadId: upload1.uploadId,
        title: 'Episode 1: Getting Started in DJing',
        description: 'Learn the basics from industry veterans',
        durationSeconds: 3600,
        publicationDate: new Date('2025-01-01'),
        episodeNumber: 1,
        explicit: false,
        monetizationRequired: false,
      },
      {
        podcastId: podcast1.podcastId,
        sourceType: 'external',
        mediaUrl: 'https://example.com/podcast/episode-2.mp3',
        title: 'Episode 2: Music Production Tips',
        description: 'Studio secrets from top producers',
        durationSeconds: 2700,
        publicationDate: new Date('2025-01-08'),
        episodeNumber: 2,
        explicit: false,
        monetizationRequired: true,
      },
    ],
  });

  console.log('✓ Created episodes');

  // ============================================================================
  // 10. CREATE MONETIZATION PLANS
  // ============================================================================
  console.log('Creating monetization plans...');

  const basicPlan = await prisma.monetizationPlan.create({
    data: {
      name: 'Basic Access',
      stripeProductId: 'prod_test_basic',
      stripePriceId: 'price_test_basic_monthly',
      priceCents: 499,
      currency: 'USD',
      billingInterval: 'monthly',
      features: JSON.stringify(['Live streams', 'Basic playlists']),
    },
  });

  const premiumPlan = await prisma.monetizationPlan.create({
    data: {
      name: 'Premium Access',
      stripeProductId: 'prod_test_premium',
      stripePriceId: 'price_test_premium_monthly',
      priceCents: 999,
      currency: 'USD',
      billingInterval: 'monthly',
      features: JSON.stringify([
        'Live streams',
        'All playlists',
        'Podcast access',
        'Ad-free listening',
      ]),
    },
  });

  console.log(`✓ Created ${2} monetization plans`);

  // ============================================================================
  // 11. CREATE SUBSCRIPTIONS
  // ============================================================================
  console.log('Creating subscriptions...');

  await prisma.subscription.create({
    data: {
      planId: premiumPlan.planId,
      userId: dj1.userId,
      stripeSubscriptionId: 'sub_test_123',
      status: 'active',
      expiresAt: new Date('2026-01-01'),
    },
  });

  console.log('✓ Created subscriptions');

  // ============================================================================
  // 12. CREATE ANALYTICS DATA
  // ============================================================================
  console.log('Creating analytics data...');

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await prisma.analytics.createMany({
    data: [
      // Stream analytics
      {
        resourceType: 'stream',
        resourceId: stream1.streamId,
        date: today,
        metric: 'listeners',
        value: 150,
      },
      {
        resourceType: 'stream',
        resourceId: stream1.streamId,
        date: yesterday,
        metric: 'listeners',
        value: 120,
      },
      {
        resourceType: 'stream',
        resourceId: stream1.streamId,
        date: twoDaysAgo,
        metric: 'listeners',
        value: 95,
      },
      // Playlist analytics
      {
        resourceType: 'playlist',
        resourceId: playlist1.playlistId,
        date: today,
        metric: 'play_count',
        value: 45,
      },
      {
        resourceType: 'playlist',
        resourceId: playlist1.playlistId,
        date: yesterday,
        metric: 'play_count',
        value: 38,
      },
      // Podcast analytics
      {
        resourceType: 'podcast',
        resourceId: podcast1.podcastId,
        date: today,
        metric: 'downloads',
        value: 89,
      },
      {
        resourceType: 'podcast',
        resourceId: podcast1.podcastId,
        date: yesterday,
        metric: 'downloads',
        value: 76,
      },
    ],
  });

  console.log('✓ Created analytics data');

  // ============================================================================
  // 13. CREATE CUSTOM DOMAINS
  // ============================================================================
  console.log('Creating custom domains...');

  await prisma.domain.create({
    data: {
      userId: dj2.userId,
      customDomain: 'podcast.techno-dj.com',
      verificationStatus: 'verified',
      tlsStatus: 'issued',
      dnsChallengeRecord: '_acme-challenge.podcast.techno-dj.com',
      verifiedAt: new Date(),
      tlsIssuedAt: new Date(),
    },
  });

  console.log('✓ Created custom domains');

  console.log('');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('Test Accounts:');
  console.log('  Admin: admin@djunion.com / AdminPass123!');
  console.log('  DJ:    dj@djunion.com / DJPass123!');
  console.log('  DJ:    techno.dj@djunion.com / DJPass123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
