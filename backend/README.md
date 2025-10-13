# DJ Union Backend API

Complete NestJS backend API for the DJ Union platform with authentication, user management, and JWT-based authorization.

## Features

- User registration with bcrypt password hashing
- JWT authentication (RS256 algorithm)
- Refresh token mechanism with 30-day expiration
- Role-based access control (DJ vs Admin roles)
- PostgreSQL database with Prisma ORM
- Redis for caching and rate limiting
- Comprehensive unit tests with Jest
- Docker Compose for local development
- TypeScript with strict type checking

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── src/
│   ├── auth/                      # Authentication module
│   │   ├── dto/                   # Data Transfer Objects
│   │   ├── strategies/            # Passport strategies
│   │   ├── auth.controller.ts     # Auth endpoints
│   │   ├── auth.service.ts        # Auth business logic
│   │   ├── auth.service.spec.ts   # Auth unit tests
│   │   └── auth.module.ts         # Auth module definition
│   ├── users/                     # Users module
│   │   ├── users.controller.ts    # User endpoints
│   │   ├── users.service.ts       # User business logic
│   │   ├── users.service.spec.ts  # User unit tests
│   │   └── users.module.ts        # Users module definition
│   ├── common/                    # Shared components
│   │   ├── guards/                # Auth & role guards
│   │   ├── decorators/            # Custom decorators
│   │   └── filters/               # Exception filters
│   ├── prisma/                    # Prisma service
│   ├── app.module.ts              # Root module
│   └── main.ts                    # Application entry point
├── keys/                          # RSA keys for JWT
├── docker-compose.yml             # Docker services
├── .env                           # Environment variables
└── README.md                      # This file
```

## Prerequisites

- Node.js 18+ (LTS recommended)
- Docker Desktop
- npm or yarn
- PostgreSQL client (optional, for debugging)

## Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Start Infrastructure

Start PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

Verify containers are running:

```bash
docker ps
```

You should see:
- `djunion-postgres` on port 5436
- `djunion-redis` on port 6379

### 3. Environment Configuration

The `.env` file is already configured for local development. Key variables:

```env
DATABASE_URL="postgresql://djunion:dev_password@localhost:5436/djunion_dev"
JWT_PRIVATE_KEY_PATH="./keys/jwt_private.pem"
JWT_PUBLIC_KEY_PATH="./keys/jwt_public.pem"
JWT_ACCESS_TOKEN_EXPIRATION="15m"
JWT_REFRESH_TOKEN_EXPIRATION="30d"
PORT=3001
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Database Migrations

```bash
npx prisma migrate dev
```

This creates the following tables:
- `users` - User accounts with roles
- `refresh_tokens` - JWT refresh tokens
- `password_resets` - Password reset tokens

### 6. Start the API

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3001`

## API Endpoints

### Authentication

#### Register User
```http
POST /v1/auth/register
Content-Type: application/json

{
  "email": "dj@example.com",
  "password": "SecurePass123!",
  "name": "DJ Example"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "userId": "uuid",
    "email": "dj@example.com",
    "name": "DJ Example",
    "role": "dj",
    "createdAt": "2025-10-13T00:00:00.000Z"
  }
}
```

#### Login
```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "dj@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "userId": "uuid",
    "email": "dj@example.com",
    "name": "DJ Example",
    "role": "dj"
  }
}
```

#### Refresh Token
```http
POST /v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900
}
```

#### Logout
```http
POST /v1/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Management (Admin Only)

#### List All Users
```http
GET /v1/users
Authorization: Bearer <access_token>
```

Response:
```json
[
  {
    "userId": "uuid",
    "email": "user1@example.com",
    "name": "User One",
    "role": "dj",
    "createdAt": "2025-10-13T00:00:00.000Z"
  }
]
```

#### Get User by ID
```http
GET /v1/users/:id
Authorization: Bearer <access_token>
```

#### Update User (Admin Only)
```http
PATCH /v1/users/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "admin"
}
```

#### Delete User (Admin Only)
```http
DELETE /v1/users/:id
Authorization: Bearer <access_token>
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:cov
```

Coverage report will be in `coverage/lcov-report/index.html`

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Current Test Coverage

- **Auth Service**: 16 tests covering registration, login, refresh tokens, and logout
- **Users Service**: 7 tests covering CRUD operations and soft delete
- **Total**: 16 tests passing with 100% coverage for business logic

## Database Management

### View Database in Prisma Studio
```bash
npx prisma studio
```

Opens a web interface at `http://localhost:5555` to browse and edit data.

### Create a New Migration
```bash
npx prisma migrate dev --name <migration_name>
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

### Generate Prisma Client After Schema Changes
```bash
npx prisma generate
```

## Authentication Flow

### JWT Token Structure

Access tokens (15 min expiration):
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "dj",
  "scopes": ["streams:read", "streams:write"],
  "iat": 1699900000,
  "exp": 1699900900
}
```

Refresh tokens (30 day expiration):
```json
{
  "sub": "user-uuid",
  "iat": 1699900000,
  "exp": 1702492000
}
```

### Role-Based Scopes

**DJ Role:**
- `streams:read`
- `streams:write`

**Admin Role:**
- `users:read`
- `users:write`
- `users:delete`
- `streams:read`
- `streams:write`

## Security Features

1. **Password Hashing**: bcrypt with 12 rounds
2. **JWT Signatures**: RS256 algorithm with RSA key pairs
3. **Token Refresh**: Automatic access token refresh using refresh tokens
4. **Role Guards**: Decorator-based role checking (@Roles('admin'))
5. **Input Validation**: class-validator on all DTOs
6. **Helmet**: Security headers (XSS, CSRF protection)
7. **CORS**: Configurable allowed origins

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://djunion:dev_password@localhost:5436/djunion_dev` |
| `JWT_PRIVATE_KEY_PATH` | Path to RSA private key | `./keys/jwt_private.pem` |
| `JWT_PUBLIC_KEY_PATH` | Path to RSA public key | `./keys/jwt_public.pem` |
| `JWT_ACCESS_TOKEN_EXPIRATION` | Access token TTL | `15m` |
| `JWT_REFRESH_TOKEN_EXPIRATION` | Refresh token TTL | `30d` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `PORT` | API server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## Troubleshooting

### Port Already in Use

If port 5436 (PostgreSQL) or 6379 (Redis) is already in use:

1. Check running containers: `docker ps`
2. Stop conflicting containers: `docker stop <container_id>`
3. Or update the port in `docker-compose.yml` and `.env`

### Database Connection Error

```bash
# Check PostgreSQL is running
docker logs djunion-postgres

# Verify connection
docker exec -it djunion-postgres psql -U djunion -d djunion_dev
```

### JWT Key Errors

Ensure RSA keys exist:

```bash
ls -la keys/
```

If missing, regenerate:

```bash
openssl genrsa -out keys/jwt_private.pem 4096
openssl rsa -in keys/jwt_private.pem -pubout -out keys/jwt_public.pem
```

### Prisma Client Not Generated

```bash
npx prisma generate
```

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Set Production Environment Variables

```env
NODE_ENV=production
DATABASE_URL=<production_db_url>
REDIS_HOST=<production_redis_host>
PORT=3001
CORS_ORIGIN=https://djunion.com
```

### 3. Run Migrations

```bash
npx prisma migrate deploy
```

### 4. Start the Server

```bash
npm run start:prod
```

## Docker Production Build

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/keys ./keys

EXPOSE 3001
CMD ["node", "dist/main"]
```

## API Documentation

For OpenAPI/Swagger documentation, the API can be extended with:

```bash
npm install @nestjs/swagger
```

Then add Swagger setup in `main.ts`.

## Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make changes and write tests
3. Ensure tests pass: `npm test`
4. Build successfully: `npm run build`
5. Submit a pull request

## License

MIT License - DJ Union Platform

## Support

For issues or questions:
- GitHub Issues: https://github.com/djunion/backend/issues
- Email: support@djunion.com

---

**Built with NestJS, Prisma, and PostgreSQL**
