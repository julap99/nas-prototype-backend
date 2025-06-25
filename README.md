# NestJS JWT Authentication Backend

A secure NestJS backend with JWT authentication, Redis session management, and MySQL database using Knex query builder.

## 🚀 Features

- **JWT Authentication** with access and refresh tokens
- **Redis** for session management
- **MySQL** database with Knex query builder
- **Secure password hashing** with bcrypt
- **Input validation** with class-validator
- **Rate limiting** with throttler
- **Security headers** with helmet
- **TypeScript** for type safety

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL server
- Redis server
- npm or yarn

## 🛠️ Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=43.216.155.73
DB_PORT=3306
DB_USER=dssb
DB_PASSWORD=dssb@123
DB_NAME=nestjs_auth

# JWT
JWT_ACCESS_SECRET=your_jwt_access_secret_here_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_change_in_production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security
BCRYPT_ROUNDS=12
```

3. **Run database migrations:**
```bash
npm run migration:run
```

4. **Seed the database (optional):**
```bash
npx knex seed:run
```

## 🏃‍♂️ Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The application will be available at `http://localhost:3000/api/v1`

## 📚 API Endpoints

### Health Check
- `GET /api/v1/health` - Health check endpoint

### Authentication
- `POST /api/v1/auth/login` - Login with email and password
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/validate` - Validate access token (protected)
- `POST /api/v1/auth/logout` - Logout (protected)
- `POST /api/v1/auth/logout-all` - Logout from all devices (protected)

### Users
- `GET /api/v1/users/profile` - Get user profile (protected)

## 🔐 Authentication Flow

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "fullName": "Admin User",
    "isActive": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Access Protected Endpoints
```bash
curl -X GET http://localhost:3000/api/v1/auth/validate \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔧 Database Commands

```bash
# Create a new migration
npm run migration:make migration_name

# Run migrations
npm run migration:run

# Rollback migrations
npm run migration:rollback
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔒 Security Features

- **Password hashing** with bcrypt (configurable rounds)
- **JWT tokens** with separate access and refresh tokens
- **Refresh token rotation** for enhanced security
- **Redis session management** for token validation
- **Rate limiting** to prevent brute force attacks
- **Input validation** and sanitization
- **Security headers** with helmet
- **CORS configuration** for cross-origin requests

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Authentication guards
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── database/            # Database configuration
│   ├── migrations/      # Database migrations
│   ├── seeds/          # Database seeds
│   ├── database.service.ts
│   └── database.module.ts
├── redis/               # Redis configuration
│   ├── redis.service.ts
│   └── redis.module.ts
├── users/               # Users module
│   ├── dto/
│   ├── entities/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts
```

## 🚀 Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Set environment variables for production**

3. **Run migrations:**
```bash
NODE_ENV=production npm run migration:run
```

4. **Start the application:**
```bash
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License. 