# Deployment Guide

## Overview

This guide covers deploying the Cirium Task API to various environments, from development to production. It includes configuration, security considerations, and monitoring setup.

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Git for version control
- Docker (optional, for containerized deployment)

## Environment Setup

### Development Environment

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd cirium-task
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**

   ```bash
   cp .env.example .env
   ```

4. **Start Services**

   ```bash
   # Terminal 1: Start database
   npm run dev:db

   # Terminal 2: Start application
   npm run dev
   ```

### Staging Environment

1. **Build Application**

   ```bash
   npm run build
   ```

2. **Environment Configuration**

   ```env
   NODE_ENV=staging
   APP_PORT=3000
   DB_URL=http://staging-db:3001
   ```

3. **Start Application**
   ```bash
   npm start
   ```

### Production Environment

1. **Build for Production**

   ```bash
   npm ci --only=production
   npm run build
   ```

2. **Environment Configuration**

   ```env
   NODE_ENV=production
   APP_PORT=3000
   DB_URL=https://production-db.example.com
   ```

3. **Start Application**
   ```bash
   npm start
   ```

## Docker Deployment

### Dockerfile

```dockerfile
# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - APP_PORT=3000
      - DB_URL=http://db:3001
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: json-server:latest
    ports:
      - '3001:3000'
    volumes:
      - ./src/db/db.json:/data/db.json
    command: --watch /data/db.json
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### Build and Run

```bash
# Build Docker image
docker build -t cirium-task-api .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Nginx Configuration

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server app:3000;
    }

    server {
        listen 80;
        server_name api.example.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.example.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Rate Limiting
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
        limit_req zone=api burst=20 nodelay;

        # Proxy Configuration
        location / {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health Check
        location /health {
            proxy_pass http://api/health;
            access_log off;
        }
    }
}
```

## Database Setup

### JSON Server (Development)

```bash
# Install JSON Server globally
npm install -g json-server

# Start JSON Server
json-server --watch src/db/db.json --port 3001

# With custom configuration
json-server --watch src/db/db.json --port 3001 --host 0.0.0.0
```

### PostgreSQL (Production)

```sql
-- Create database
CREATE DATABASE cirium_task;

-- Create user
CREATE USER cirium_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cirium_task TO cirium_user;

-- Create tables
CREATE TABLE flights (
    id SERIAL PRIMARY KEY,
    arrival_aerodrome VARCHAR(3) NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    departure_aerodrome VARCHAR(3) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE airports (
    id SERIAL PRIMARY KEY,
    iata VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_flights_departure_time ON flights(departure_time);
CREATE INDEX idx_flights_arrival_time ON flights(arrival_time);
CREATE INDEX idx_airports_iata ON airports(iata);
```

### Database Migration

```typescript
// src/db/migration.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function runMigrations() {
  const client = await pool.connect();

  try {
    // Run migration SQL
    await client.query(`
      CREATE TABLE IF NOT EXISTS flights (
        id SERIAL PRIMARY KEY,
        arrival_aerodrome VARCHAR(3) NOT NULL,
        arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
        departure_aerodrome VARCHAR(3) NOT NULL,
        departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}
```

## Environment Variables

### Development

```env
NODE_ENV=development
APP_PORT=3000
DB_URL=http://localhost:3001
LOG_LEVEL=debug
```

### Staging

```env
NODE_ENV=staging
APP_PORT=3000
DB_URL=http://staging-db:3001
LOG_LEVEL=info
CORS_ORIGIN=https://staging.example.com
```

### Production

```env
NODE_ENV=production
APP_PORT=3000
DB_URL=https://production-db.example.com
LOG_LEVEL=warn
CORS_ORIGIN=https://api.example.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Configuration

### SSL/TLS Setup

1. **Generate SSL Certificate**

   ```bash
   # Using Let's Encrypt
   certbot certonly --standalone -d api.example.com

   # Copy certificates
   cp /etc/letsencrypt/live/api.example.com/fullchain.pem ssl/cert.pem
   cp /etc/letsencrypt/live/api.example.com/privkey.pem ssl/key.pem
   ```

2. **Certificate Renewal**
   ```bash
   # Add to crontab
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Firewall Configuration

```bash
# UFW (Ubuntu)
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# iptables
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j DROP
```

### Application Security

```typescript
// src/middlewares/security.middleware.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  }),
];
```

## Monitoring and Logging

### Health Check Endpoint

```typescript
// src/controllers/health.controller.ts
import { Request, Response } from 'express';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Check database connection
    await checkDatabaseConnection();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};
```

### Logging Configuration

```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

### Process Management

```bash
# Using PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name "cirium-task-api"

# Monitor
pm2 monit

# Logs
pm2 logs cirium-task-api

# Restart
pm2 restart cirium-task-api

# Stop
pm2 stop cirium-task-api
```

### PM2 Configuration

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cirium-task-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/cirium-task
            git pull origin main
            npm ci --only=production
            npm run build
            pm2 restart cirium-task-api
```

### Docker Registry

```bash
# Build and push to registry
docker build -t your-registry/cirium-task-api:latest .
docker push your-registry/cirium-task-api:latest

# Deploy from registry
docker pull your-registry/cirium-task-api:latest
docker stop cirium-task-api
docker rm cirium-task-api
docker run -d --name cirium-task-api -p 3000:3000 your-registry/cirium-task-api:latest
```

## Backup and Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump -h localhost -U cirium_user cirium_task > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -h localhost -U cirium_user cirium_task < backup_20240101_120000.sql
```

### Application Backup

```bash
# Backup application files
tar -czf cirium-task-backup-$(date +%Y%m%d_%H%M%S).tar.gz /opt/cirium-task

# Backup with exclusions
tar -czf cirium-task-backup-$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=logs \
  --exclude=.git \
  /opt/cirium-task
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Find process using port
   lsof -i :3000

   # Kill process
   kill -9 <PID>
   ```

2. **Database Connection Issues**

   ```bash
   # Check database status
   systemctl status postgresql

   # Check connection
   psql -h localhost -U cirium_user -d cirium_task
   ```

3. **Memory Issues**

   ```bash
   # Check memory usage
   free -h

   # Check process memory
   ps aux --sort=-%mem | head
   ```

### Log Analysis

```bash
# View application logs
tail -f logs/combined.log

# Filter error logs
grep "ERROR" logs/combined.log

# Monitor real-time
tail -f logs/combined.log | grep "ERROR"
```

### Performance Monitoring

```bash
# Monitor system resources
htop

# Monitor network connections
netstat -tulpn

# Monitor disk usage
df -h
```

## Scaling

### Horizontal Scaling

1. **Load Balancer Configuration**

   ```nginx
   upstream api_backend {
       server app1:3000;
       server app2:3000;
       server app3:3000;
   }
   ```

2. **Session Management**
   - Use stateless authentication
   - Store session data in Redis
   - Implement sticky sessions if needed

### Vertical Scaling

1. **Resource Optimization**

   - Increase server memory
   - Use faster CPU
   - Optimize database queries

2. **Caching Strategy**
   - Implement Redis caching
   - Cache frequently accessed data
   - Use CDN for static assets

## Maintenance

### Regular Tasks

1. **Security Updates**

   ```bash
   # Update dependencies
   npm audit
   npm update

   # Update system packages
   apt update && apt upgrade
   ```

2. **Log Rotation**

   ```bash
   # Configure logrotate
   sudo nano /etc/logrotate.d/cirium-task
   ```

3. **Database Maintenance**

   ```sql
   -- Analyze tables
   ANALYZE flights;
   ANALYZE airports;

   -- Vacuum database
   VACUUM ANALYZE;
   ```

### Monitoring Alerts

1. **Set up monitoring**

   - CPU usage > 80%
   - Memory usage > 90%
   - Disk usage > 85%
   - Response time > 5s
   - Error rate > 5%

2. **Alerting Channels**
   - Email notifications
   - Slack integration
   - PagerDuty for critical alerts
