export const userFixtures = {
  validDJ: {
    email: 'dj@test.com',
    password: 'SecurePass123!',
    name: 'Test DJ',
    role: 'dj',
  },
  validAdmin: {
    email: 'admin@test.com',
    password: 'AdminPass123!',
    name: 'Test Admin',
    role: 'admin',
  },
  anotherDJ: {
    email: 'dj2@test.com',
    password: 'SecurePass456!',
    name: 'Another DJ',
    role: 'dj',
  },
  invalidEmail: {
    email: 'invalid-email',
    password: 'SecurePass123!',
    name: 'Invalid User',
    role: 'dj',
  },
  weakPassword: {
    email: 'weak@test.com',
    password: '123',
    name: 'Weak Pass User',
    role: 'dj',
  },
  missingFields: {
    email: 'missing@test.com',
  },
};

export const createUserFixture = (overrides = {}) => ({
  email: 'user-${Date.now()}@test.com',
  password: 'SecurePass123!',
  name: 'Generated Test User',
  role: 'dj',
  ...overrides,
});
