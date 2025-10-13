# DJ Union Backend Testing Guide

**Version:** 1.0.0  
**Last Updated:** October 12, 2025  
**Target Coverage:** ≥80%

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Setup & Configuration](#setup--configuration)
4. [Test Structure](#test-structure)
5. [Writing Tests](#writing-tests)
6. [Running Tests](#running-tests)
7. [Code Coverage](#code-coverage)
8. [Best Practices](#best-practices)
9. [Continuous Integration](#continuous-integration)

---

## Overview

The DJ Union backend uses a comprehensive testing strategy with three layers:

- **Unit Tests**: Test individual services, utilities, and functions in isolation
- **Integration Tests**: Test API endpoints with real database connections
- **E2E Tests**: Test complete user workflows from end to end

### Testing Stack

- **Framework**: Jest (v29.7.0)
- **API Testing**: Supertest (v6.3.3)
- **Mocking**: Jest built-in mocking + custom mocks
- **Database**: PostgreSQL test instance via Docker
- **Coverage**: Built-in Jest coverage with 80% threshold

---

## Testing Philosophy

### Principles

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Isolation**: Unit tests should not depend on external services or databases
3. **Deterministic**: Tests should produce the same results every time
4. **Fast**: Keep tests fast by minimizing I/O operations
5. **Readable**: Tests serve as living documentation

### Coverage Goals

| Metric | Target | Critical Paths |
|--------|--------|---------------|
| Lines | ≥80% | ≥90% |
| Functions | ≥80% | ≥90% |
| Branches | ≥80% | ≥85% |
| Statements | ≥80% | ≥90% |

**Critical Paths:**
- Authentication flow (register, login, refresh, logout)
- Stream registration and heartbeat handling
- File upload and transcoding triggers
- Payment and subscription management
- Data access control and permissions

---

## Setup & Configuration

### Prerequisites

```bash
# Required tools
- Node.js 18+ (LTS)
- Docker Desktop
- PostgreSQL client (psql)
```

### Initial Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Start test infrastructure
docker-compose -f docker-compose.test.yml up -d

# 3. Wait for services to be ready
docker-compose -f docker-compose.test.yml ps

# 4. Run database migrations
export DATABASE_URL=postgresql://djunion_test:test_password@localhost:5433/djunion_test
npx prisma migrate deploy

# 5. Generate Prisma client
npx prisma generate

# 6. Verify setup
npm test -- --testPathPattern=health.spec.ts
```

### Environment Configuration

Test environment variables are in `.env.test`:

```env
NODE_ENV=test
DATABASE_URL=postgresql://djunion_test:test_password@localhost:5433/djunion_test
REDIS_URL=redis://localhost:6380
S3_ENDPOINT=http://localhost:9001
JWT_PRIVATE_KEY_PATH=./test/keys/jwt_private_test.pem
JWT_PUBLIC_KEY_PATH=./test/keys/jwt_public_test.pem
```

---

## Test Structure

### Directory Layout

```
backend/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── tests/
│   │       ├── auth.service.spec.ts          # Unit tests
│   │       └── auth.controller.spec.ts        # Unit tests
│   ├── streams/
│   │   └── tests/
│   ├── playlists/
│   └── common/
├── test/
│   ├── helpers/
│   │   ├── test-db.helper.ts                  # Database utilities
│   │   └── test-module.helper.ts              # Test module factories
│   ├── fixtures/
│   │   ├── user.fixtures.ts                   # Test data
│   │   ├── stream.fixtures.ts
│   │   └── playlist.fixtures.ts
│   ├── mocks/
│   │   ├── prisma.mock.ts                     # Service mocks
│   │   └── jwt.mock.ts
│   ├── *.integration-spec.ts                   # Integration tests
│   └── *.e2e-spec.ts                          # E2E tests
├── jest.config.js                              # Unit test config
├── test/jest-integration.json                  # Integration config
└── test/jest-e2e.json                         # E2E config
```

### Naming Conventions

- **Unit tests**: `*.spec.ts` (placed in `src/*/tests/`)
- **Integration tests**: `*.integration-spec.ts` (placed in `test/`)
- **E2E tests**: `*.e2e-spec.ts` (placed in `test/`)
- **Fixtures**: `*.fixtures.ts`
- **Mocks**: `*.mock.ts`
- **Helpers**: `*.helper.ts`

---

## Writing Tests

### Unit Test Example

```typescript
// src/auth/tests/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { mockPrismaService } from '../../../test/mocks/prisma.mock';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      // Arrange
      const userData = {
        email: 'test@test.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };
      mockPrismaService.user.create.mockResolvedValue({
        user_id: 'test-id',
        ...userData,
        password_hash: 'hashed',
      });

      // Act
      const result = await service.register(userData);

      // Assert
      expect(result).toHaveProperty('user_id');
      expect(prismaService.user.create).toHaveBeenCalled();
    });
  });
});
```

### Integration Test Example

```typescript
// test/streams.integration-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './helpers/test-db.helper';

describe('Streams API (Integration)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login
    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ email: 'test@test.com', password: 'Pass123!', name: 'Test' });

    const loginRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'test@test.com', password: 'Pass123!' });

    authToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  describe('POST /v1/streams', () => {
    it('should create a new stream', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/streams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Stream',
          shoutcast_url: 'http://test.com:8000',
          mount: '/live',
          stream_key: 'key123',
          visibility: 'public',
        })
        .expect(201);

      expect(response.body).toHaveProperty('stream_id');
    });
  });
});
```

### E2E Test Example

```typescript
// test/auth-workflow.e2e-spec.ts
describe('Complete Authentication Flow (E2E)', () => {
  it('should handle register -> login -> refresh -> logout', async () => {
    // 1. Register
    const regRes = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send(testUser)
      .expect(201);

    // 2. Login
    const loginRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    const { access_token, refresh_token } = loginRes.body;

    // 3. Access protected route
    await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${access_token}`)
      .expect(200);

    // 4. Refresh token
    const refreshRes = await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .send({ refresh_token })
      .expect(200);

    // 5. Logout
    await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .send({ refresh_token })
      .expect(200);
  });
});
```

---

## Running Tests

### Command Reference

```bash
# Run all unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run all tests with coverage
npm run test:cov

# Run tests for CI/CD
npm run test:ci

# Run specific test file
npm test -- auth.service.spec.ts

# Run tests matching pattern
npm test -- --testPathPattern=auth

# Run tests in debug mode
npm run test:debug
```

### Test Execution Order

1. **Unit tests first**: Fastest, run on every change
2. **Integration tests**: Run before commits
3. **E2E tests**: Run before PRs and in CI/CD

### Parallel Execution

```bash
# Run tests in parallel (CI mode)
npm run test:ci -- --maxWorkers=4

# Run tests serially (debugging)
npm test -- --runInBand
```

---

## Code Coverage

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:cov

# Open HTML report in browser
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Configured in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

### Excluded from Coverage

- `*.module.ts` - Module definitions
- `main.ts` - Application entry point
- `*.interface.ts` - Type definitions
- `*.dto.ts` - Data transfer objects
- `*.entity.ts` - Database entities

### Coverage Strategies

1. **Start with critical paths**: Auth, payments, data access
2. **Test edge cases**: Errors, boundaries, null values
3. **Test error handling**: Exception scenarios
4. **Test validation**: Input validation and sanitization
5. **Test business logic**: Core functionality

---

## Best Practices

### Testing Patterns

#### AAA Pattern (Arrange-Act-Assert)

```typescript
it('should do something', async () => {
  // Arrange: Set up test data and mocks
  const input = { name: 'Test' };
  mockService.method.mockResolvedValue(expectedOutput);

  // Act: Execute the code under test
  const result = await service.doSomething(input);

  // Assert: Verify the results
  expect(result).toBe(expectedOutput);
  expect(mockService.method).toHaveBeenCalledWith(input);
});
```

#### Test Data Management

```typescript
// Use fixtures for consistent test data
import { userFixtures } from '../../../test/fixtures/user.fixtures';

it('should validate user', () => {
  const user = userFixtures.validDJ;
  expect(validator.validate(user)).toBe(true);
});

// Generate unique data when needed
const createUniqueUser = () => ({
  email: `user-${Date.now()}@test.com`,
  password: 'Pass123!',
  name: 'Test User',
});
```

#### Mocking External Services

```typescript
// Mock Prisma
jest.mock('../../prisma/prisma.service');

// Mock HTTP requests
jest.mock('axios');

// Mock file system
jest.mock('fs');
```

### Common Pitfalls

1. **Testing implementation instead of behavior**
   - Bad: `expect(service.internalMethod).toHaveBeenCalled()`
   - Good: `expect(result.status).toBe('success')`

2. **Tests depending on execution order**
   - Use `beforeEach` to reset state
   - Don't rely on data from previous tests

3. **Not cleaning up resources**
   - Close database connections in `afterAll`
   - Clear mocks in `afterEach`

4. **Hardcoded values instead of fixtures**
   - Use fixtures for maintainable test data
   - Generate unique values when needed

5. **Too many assertions in one test**
   - One logical assertion per test
   - Use descriptive test names

---

## Continuous Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: djunion_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

```bash
# Install husky
npm install -D husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check if test database is running
docker-compose -f docker-compose.test.yml ps

# Restart test database
docker-compose -f docker-compose.test.yml restart postgres-test

# Reset database
npm run db:reset
```

#### Port Conflicts

```bash
# Check ports in use
lsof -i :5433
lsof -i :6380
lsof -i :9001

# Kill processes
kill -9 <PID>
```

#### Flaky Tests

- Use `jest.setTimeout()` for slow tests
- Add proper `await` for async operations
- Reset state between tests
- Check for race conditions

---

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest API](https://github.com/visionmedia/supertest)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing/unit-testing)

---

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Maintain ≥80% coverage
3. Add integration tests for new endpoints
4. Add E2E tests for new workflows
5. Update this guide with new patterns

---

**Questions?** Contact the team or open an issue in the repository.
