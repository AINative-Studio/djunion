export const streamFixtures = {
  validStream: {
    name: 'Test Radio Stream',
    shoutcast_url: 'http://test.example.com:8000',
    mount: '/live',
    stream_key: 'test_stream_key_123',
    genre: 'Electronic',
    description: 'Test stream for integration testing',
    visibility: 'public',
    monetization_enabled: false,
  },
  privateStream: {
    name: 'Private Stream',
    shoutcast_url: 'http://private.example.com:8000',
    mount: '/private',
    stream_key: 'private_key_456',
    genre: 'House',
    description: 'Private test stream',
    visibility: 'private',
    monetization_enabled: false,
  },
  monetizedStream: {
    name: 'Premium Stream',
    shoutcast_url: 'http://premium.example.com:8000',
    mount: '/premium',
    stream_key: 'premium_key_789',
    genre: 'Techno',
    description: 'Monetized stream requiring subscription',
    visibility: 'public',
    monetization_enabled: true,
  },
};

export const createStreamFixture = (overrides = {}) => {
  const timestamp = Date.now();
  return {
    name: 'Stream ' + timestamp,
    shoutcast_url: 'http://test.example.com:8000',
    mount: '/stream-' + timestamp,
    stream_key: 'key_' + timestamp,
    genre: 'Electronic',
    description: 'Auto-generated test stream',
    visibility: 'public',
    monetization_enabled: false,
    ...overrides,
  };
};
