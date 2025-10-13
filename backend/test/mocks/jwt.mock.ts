export const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({
    sub: 'mock-user-id',
    email: 'mock@test.com',
    role: 'dj',
  }),
  decode: jest.fn(),
};

export const mockAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

export const mockUser = {
  user_id: 'test-user-id',
  email: 'test@test.com',
  name: 'Test User',
  role: 'dj',
};
