export const podcastFixtures = {
  publicPodcast: {
    title: 'DJ Talk Show',
    description: 'Weekly interviews with top DJs',
    language: 'en-us',
    author: 'Test DJ',
    explicit: false,
    monetization_enabled: false,
  },
  explicitPodcast: {
    title: 'Uncensored Music Talk',
    description: 'Raw conversations about music',
    language: 'en-us',
    author: 'Test Host',
    explicit: true,
    monetization_enabled: false,
  },
  premiumPodcast: {
    title: 'Exclusive Interviews',
    description: 'Premium content for subscribers only',
    language: 'en-us',
    author: 'Premium Host',
    explicit: false,
    monetization_enabled: true,
  },
};

export const episodeFixtures = {
  uploadedEpisode: {
    source_type: 'upload',
    title: 'Episode 1: Getting Started',
    description: 'Introduction to DJing',
    duration_seconds: 3600,
    episode_number: 1,
    explicit: false,
    monetization_required: false,
  },
  externalEpisode: {
    source_type: 'external',
    media_url: 'https://example.com/episode.mp3',
    title: 'Episode 2: Advanced Techniques',
    description: 'Deep dive into mixing',
    duration_seconds: 4200,
    episode_number: 2,
    explicit: false,
    monetization_required: false,
  },
};
