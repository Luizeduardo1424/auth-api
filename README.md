# Auth API

RESTful Authentication Service built with Node.js, TypeScript and PostgreSQL.

## Features

- User registration and login with JWT authentication
- Access Token + Refresh Token strategy with rotation
- Token revocation and secure logout
- Password hashing with bcrypt
- Input validation with Zod
- Rate limiting on sensitive endpoints
- Security headers with Helmet
- Structured logging with Pino
- Automated tests with Jest and Supertest

## Tech Stack

| Category        | Technology                  |
|-----------------|-----------------------------|
| Runtime         | Node.js 20 LTS              |
| Language        | TypeScript 5.x              |
| Framework       | Express 4.x                 |
| Database        | PostgreSQL 16               |
| DB Driver       | node-postgres (pg)          |
| Authentication  | JSON Web Tokens (JWT)       |
| Validation      | Zod                         |
| Testing         | Jest + Supertest            |
| Logging         | Pino                        |
| Code Quality    | ESLint + Prettier + Husky   |

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose

### Installation
```bash
# Clone the repository
git clone https://github.com/Luizeduardo1424/auth-api.git
cd auth-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values
```

### Running the database
```bash
docker compose up -d
```

### Running migrations
```bash
npm run migrate
```

### Starting the server
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Documentation

With the server running, access the Swagger UI at:
```
http://localhost:3000/api/v1/docs
```

## Endpoints

### Auth (public)

| Method | Endpoint                | Description                  |
|--------|-------------------------|------------------------------|
| POST   | /api/v1/auth/register   | Register a new user          |
| POST   | /api/v1/auth/login      | Login and receive tokens     |
| POST   | /api/v1/auth/refresh    | Refresh access token         |
| POST   | /api/v1/auth/logout     | Revoke refresh token         |

### Users (protected — requires Bearer JWT)

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/v1/users/me            | Get current user         |
| PATCH  | /api/v1/users/me            | Update current user      |
| DELETE | /api/v1/users/me            | Delete account           |
| POST   | /api/v1/users/me/password   | Change password          |

### Health

| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| GET    | /api/v1/health    | API and DB status   |

## Running Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Architecture

The project follows a layered architecture with clear separation of concerns:
```
src/
├── config/          # Environment, logger and Swagger config
├── database/        # Connection pool and migrations
├── middlewares/     # Auth, validation, rate limiting, error handler
├── modules/
│   ├── auth/        # Register, login, refresh, logout
│   └── users/       # Profile management
└── shared/          # Custom errors, types and utilities
```

Each module contains:
- `*.repository.interface.ts` — Repository contract
- `*.repository.postgres.ts` — PostgreSQL implementation
- `*.service.ts` — Business logic
- `*.controller.ts` — HTTP layer
- `*.routes.ts` — Route definitions
- `*.schemas.ts` — Zod validation schemas
- `make*.ts` — Dependency injection composition

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT Access Token expires in 15 minutes
- JWT Refresh Token expires in 7 days with rotation
- Rate limiting: 5 requests / 15 min on auth endpoints
- Parameterized queries to prevent SQL injection
- Security headers via Helmet
- Environment variables validated at startup with Zod

## License

MIT