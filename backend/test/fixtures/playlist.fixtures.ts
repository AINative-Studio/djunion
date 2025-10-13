export const playlistFixtures = {
  publicPlaylist: {
    title: 'Summer Mix 2025',
    description: 'Best tracks for summer',
    visibility: 'public',
    monetization_enabled: false,
  },
  privatePlaylist: {
    title: 'Private Collection',
    description: 'My personal favorites',
    visibility: 'private',
    monetization_enabled: false,
  },
  premiumPlaylist: {
    title: 'Exclusive Tracks',
    description: 'Premium content for subscribers',
    visibility: 'public',
    monetization_enabled: true,
  },
};

export const trackFixtures = {
  uploadedTrack: {
    source_type: 'upload',
    title: 'Uploaded Song',
    artist: 'Test Artist',
    duration_seconds: 240,
  },
  externalTrack: {
    source_type: 'external',
    url: 'https://example.com/track.mp3',
    title: 'External Song',
    artist: 'External Artist',
    duration_seconds: 180,
  },
};

export const createPlaylistFixture = (overrides = {}) => ({
  title: `Playlist ${Date.now()}`,
  description: 'Auto-generated test playlist',
  visibility: 'public',
  monetization_enabled: false,
  ...overrides,
});

export const createTrackFixture = (overrides = {}) => ({
  source_type: 'upload',
  title: `Track ${Date.now()}`,
  artist: 'Test Artist',
  duration_seconds: 200,
  ...overrides,
});
