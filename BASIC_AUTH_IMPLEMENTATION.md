# Basic Auth Implementation for Third-Party Platforms

This document explains the implementation of Basic Authentication for third-party platform access to the NAS Prototype API.

## Overview

The Basic Auth implementation provides a secure way for third-party platforms to access specific endpoints using username and password credentials stored in the `BP_access` table.

## Database Setup

### 1. Run Migration
```bash
cd backend
npm run migration:run
```

This will create the `BP_access` table with the following structure:
- `id` - Primary key
- `username` - Unique username for authentication
- `password` - Hashed password using bcrypt
- `isActive` - Boolean flag to enable/disable access
- `created_at` - Timestamp when record was created
- `updated_at` - Timestamp when record was last updated

### 2. Seed Test Data
```bash
cd backend
npm run seed:run
```

This will create test credentials:
- Username: `admin`, Password: `admin123`
- Username: `thirdparty`, Password: `admin123`

## Implementation Details

### Files Created/Modified

1. **Entity**: `backend/src/auth/entities/bp-access.entity.ts`
   - Defines the BpAccess interface

2. **Service**: `backend/src/auth/bp-access.service.ts`
   - Handles credential validation against the BP_access table
   - Uses bcrypt for password comparison

3. **Strategy**: `backend/src/auth/strategies/basic.strategy.ts`
   - Passport strategy for Basic Auth
   - Validates credentials using BpAccessService

4. **Guard**: `backend/src/auth/guards/basic-auth.guard.ts`
   - NestJS guard that uses the Basic strategy

5. **Migration**: `backend/src/database/migrations/20241201000003_create_bp_access_table.js`
   - Creates the BP_access table

6. **Seed**: `backend/src/database/seeds/01_bp_access_seed.js`
   - Populates test data

### Updated Files

1. **Auth Module**: `backend/src/auth/auth.module.ts`
   - Added BasicStrategy and BpAccessService to providers
   - Exported BpAccessService for use in other modules

2. **Auth Controller**: `backend/src/auth/auth.controller.ts`
   - Added test endpoint `/auth/basic-test` for Basic Auth verification

3. **Asnaf Profiling Controller**: `backend/src/asnaf/profiling/asnaf-profiling.controller.ts`
   - Updated endpoints to use BasicAuthGuard instead of JwtAuthGuard
   - Now protected for third-party access

## Usage

### Testing Basic Auth

1. **Test Endpoint**
```bash
curl -X GET http://localhost:3000/auth/basic-test \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

2. **Asnaf Profiling Endpoints**
```bash
# Create pendidikan record
curl -X POST http://localhost:3000/asnaf/profiling/pendidikan \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM=" \
  -H "Content-Type: application/json" \
  -d '{
    "asnafUuid": "test-uuid",
    "institutionName": "Test University",
    "level": "Bachelor"
  }'

# Get pendidikan record
curl -X GET http://localhost:3000/asnaf/profiling/pendidikan/test-uuid \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="
```

### Base64 Encoding

The Authorization header uses Base64 encoding: `Basic <base64(username:password)>`

Example:
- Username: `admin`
- Password: `admin123`
- Combined: `admin:admin123`
- Base64: `YWRtaW46YWRtaW4xMjM=`

### Adding New Credentials

To add new credentials for third-party platforms:

1. **Hash the password**:
```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash('your_password', 12);
```

2. **Insert into database**:
```sql
INSERT INTO BP_access (username, password, isActive, created_at, updated_at)
VALUES ('your_username', 'hashed_password', true, NOW(), NOW());
```

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt with 12 rounds
2. **HTTPS Required**: Basic Auth should only be used over HTTPS in production
3. **Credential Rotation**: Regularly rotate credentials for third-party platforms
4. **Access Control**: Use the `isActive` flag to disable access when needed
5. **Rate Limiting**: Consider implementing rate limiting for Basic Auth endpoints

## Error Handling

- **401 Unauthorized**: Invalid credentials or inactive account
- **400 Bad Request**: Missing or malformed Authorization header
- **500 Internal Server Error**: Database connection issues

## Future Enhancements

1. **API Key Authentication**: Consider implementing API key-based auth for better security
2. **OAuth 2.0**: For more complex third-party integrations
3. **Audit Logging**: Log all Basic Auth attempts for security monitoring
4. **Credential Expiration**: Add expiration dates for credentials

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Check if username exists in BP_access table
   - Verify password is correctly hashed
   - Ensure isActive is true

2. **"Cannot find module 'passport-http'" error**
   - Run: `npm install passport-http @types/passport-http`

3. **Database connection issues**
   - Verify database connection settings in .env
   - Check if BP_access table exists

### Debug Mode

Enable debug logging by adding to your .env:
```env
DEBUG=passport:*
```

This will show detailed authentication flow logs. 