# Deployment Fix for Basic Auth

## Issue
The production server is failing because the `passport-http` module is missing from the dependencies.

## Solution

### 1. Update package.json (Already Done)
The package.json has been updated with the correct dependencies:
- `passport-http`: "^0.3.0"
- `@types/passport-http`: "^0.3.11"

### 2. Deploy to Production Server

#### Option A: Using Git (Recommended)
```bash
# On your local machine
git add .
git commit -m "Add passport-http dependencies for Basic Auth"
git push origin main

# On production server
cd /home/ubuntu/nas-prototype-backend
git pull origin main
npm install
npm run build
pm2 restart api
```

#### Option B: Manual Update
```bash
# On production server
cd /home/ubuntu/nas-prototype-backend

# Install the missing dependencies
npm install passport-http@^0.3.0 @types/passport-http@^0.3.11

# Rebuild the application
npm run build

# Restart the PM2 process
pm2 restart api
```

### 3. Verify Installation
```bash
# Check if dependencies are installed
npm list passport-http
npm list @types/passport-http

# Check PM2 status
pm2 status
pm2 logs api
```

### 4. Test Basic Auth
After deployment, test the Basic Auth endpoints:

```bash
# Test Basic Auth endpoint
curl -X GET http://your-server-url/auth/basic-test \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM="

# Test Asnaf Profiling endpoint
curl -X POST http://your-server-url/asnaf/profiling/pendidikan \
  -H "Authorization: Basic YWRtaW46YWRtaW4xMjM=" \
  -H "Content-Type: application/json" \
  -d '{
    "asnafUuid": "test-uuid",
    "institutionName": "Test University",
    "level": "Bachelor"
  }'
```

## Credentials for Testing
- **Username:** `admin`
- **Password:** `admin123`
- **Base64:** `YWRtaW46YWRtaW4xMjM=`

## Troubleshooting

### If build fails:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### If PM2 restart fails:
```bash
# Check PM2 logs
pm2 logs api

# Restart with fresh start
pm2 delete api
pm2 start dist/main.js --name api
```

### If Basic Auth still doesn't work:
```bash
# Check if BP_access table exists and has data
mysql -u your_user -p your_database -e "SELECT * FROM BP_access;"

# Verify password hashes
mysql -u your_user -p your_database -e "SELECT username, password FROM BP_access WHERE username='admin';"
```

## Files Modified
- `package.json` - Added passport-http dependencies
- `src/auth/strategies/basic.strategy.ts` - Basic Auth strategy
- `src/auth/guards/basic-auth.guard.ts` - Basic Auth guard
- `src/auth/bp-access.service.ts` - BP_access service
- `src/auth/entities/bp-access.entity.ts` - BP_access entity
- `src/auth/auth.module.ts` - Updated auth module
- `src/auth/auth.controller.ts` - Added test endpoint
- `src/asnaf/profiling/asnaf-profiling.controller.ts` - Updated to use Basic Auth 