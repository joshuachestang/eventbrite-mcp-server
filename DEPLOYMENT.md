# Deployment Guide

This guide covers various deployment options for the Eventbrite MCP Server.

## Table of Contents

- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [CI/CD Setup](#cicd-setup)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Local Development

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/joshuachestang/eventbrite-mcp-server.git
cd eventbrite-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your Eventbrite API token
```

4. Build and test:
```bash
npm run build
npm test
```

### Development Workflow

```bash
# Start development with auto-rebuild
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Production Deployment

### Environment Setup

1. **Environment Variables**:
```bash
EVENTBRITE_API_TOKEN=your_production_token
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

2. **Build for Production**:
```bash
npm ci --only=production
npm run build
```

3. **Start the Server**:
```bash
npm start
```

### Process Management

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start dist/index.js --name eventbrite-mcp

# Save PM2 configuration
pm2 save

# Setup auto-restart on system reboot
pm2 startup
```

#### Using systemd (Linux)

Create `/etc/systemd/system/eventbrite-mcp.service`:

```ini
[Unit]
Description=Eventbrite MCP Server
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/eventbrite-mcp-server
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=EVENTBRITE_API_TOKEN=your_token_here

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable eventbrite-mcp
sudo systemctl start eventbrite-mcp
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

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
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  eventbrite-mcp:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - EVENTBRITE_API_TOKEN=${EVENTBRITE_API_TOKEN}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    volumes:
      - ./logs:/app/logs
```

### Build and Run

```bash
# Build the image
docker build -t eventbrite-mcp-server .

# Run with environment variables
docker run -d \
  --name eventbrite-mcp \
  -p 3000:3000 \
  -e EVENTBRITE_API_TOKEN=your_token_here \
  eventbrite-mcp-server

# Or use docker-compose
docker-compose up -d
```

## Cloud Deployment

### AWS ECS

1. **Create Task Definition**:
```json
{
  "family": "eventbrite-mcp",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "eventbrite-mcp",
      "image": "your-account.dkr.ecr.region.amazonaws.com/eventbrite-mcp:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "EVENTBRITE_API_TOKEN",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:eventbrite-token"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/eventbrite-mcp",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

2. **Deploy with AWS CLI**:
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker build -t eventbrite-mcp .
docker tag eventbrite-mcp:latest your-account.dkr.ecr.us-east-1.amazonaws.com/eventbrite-mcp:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/eventbrite-mcp:latest

# Create service
aws ecs create-service \
  --cluster your-cluster \
  --service-name eventbrite-mcp \
  --task-definition eventbrite-mcp:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/your-project/eventbrite-mcp
gcloud run deploy eventbrite-mcp \
  --image gcr.io/your-project/eventbrite-mcp \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production \
  --set-secrets EVENTBRITE_API_TOKEN=eventbrite-token:latest
```

### Azure Container Instances

```bash
# Create resource group
az group create --name eventbrite-mcp-rg --location eastus

# Deploy container
az container create \
  --resource-group eventbrite-mcp-rg \
  --name eventbrite-mcp \
  --image your-registry.azurecr.io/eventbrite-mcp:latest \
  --cpu 1 \
  --memory 1 \
  --ports 3000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables EVENTBRITE_API_TOKEN=your_token_here
```

## CI/CD Setup

### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          echo "Deploying to production..."
```

### GitLab CI

`.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run build
    - npm test

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  script:
    - echo "Deploy to production"
  only:
    - main
```

## Monitoring

### Health Checks

Add health check endpoint to your server:

```typescript
// Add to index.ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

### Logging

Configure structured logging:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

### Metrics

Add Prometheus metrics:

```typescript
import promClient from 'prom-client';

const register = new promClient.Registry();
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

2. **Memory Issues**:
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 dist/index.js
```

3. **Permission Errors**:
```bash
# Fix file permissions
chmod +x dist/index.js
chown -R nodejs:nodejs /app
```

### Debug Mode

Enable debug logging:
```bash
DEBUG=eventbrite-mcp:* npm start
```

### Performance Tuning

1. **Enable clustering**:
```typescript
import cluster from 'cluster';
import os from 'os';

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
} else {
  // Start your server
}
```

2. **Configure garbage collection**:
```bash
node --gc-interval=100 --max-old-space-size=2048 dist/index.js
```

### Backup and Recovery

1. **Configuration Backup**:
```bash
# Backup environment variables
cp .env .env.backup

# Backup configuration
tar -czf config-backup.tar.gz *.json *.yml
```

2. **Database Backup** (if applicable):
```bash
# Example for MongoDB
mongodump --host localhost --db eventbrite_mcp --out backup/
```

## Security Considerations

1. **Environment Variables**:
   - Never commit secrets to version control
   - Use secret management services
   - Rotate API tokens regularly

2. **Network Security**:
   - Use HTTPS in production
   - Configure firewalls
   - Implement rate limiting

3. **Container Security**:
   - Use non-root users
   - Scan images for vulnerabilities
   - Keep base images updated

## Support

For deployment issues:
- Check the logs first
- Review the troubleshooting section
- Open an issue on GitHub
- Contact the maintainers

## Updates

To update a deployed instance:

1. **Rolling Update**:
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci --only=production

# Build
npm run build

# Restart service
pm2 restart eventbrite-mcp
```

2. **Blue-Green Deployment**:
```bash
# Deploy to staging
deploy-to-staging.sh

# Test staging
run-integration-tests.sh

# Switch traffic
switch-traffic.sh
``` 