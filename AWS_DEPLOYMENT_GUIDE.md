# KrishiSetu — Docker & AWS Cloud Infrastructure Guide

This document provides end-to-end instructions for containerizing KrishiSetu locally with Docker and deploying to Amazon Web Services (AWS) using **Elastic Beanstalk**, **Amazon ECS Fargate**, and **Amazon S3**.

---

## 1. Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                  Amazon Route 53                                  |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        Application Load Balancer (ALB)                            |
|                  Port 80/443 -> Directs /api and WebSockets                       |
+-----------------------------------------------------------------------------------+
          |                                                               |
          v (Port 80)                                                     v (Port 5000)
+------------------------------------+        +-------------------------------------+
|   krishisetu-frontend (Nginx)      |        |     krishisetu-backend (Node.js)    |
|   - SPA Static Bundles             | -----> |     - REST APIs & GraphQL           |
|   - Gzip Compression               | (proxy)|     - Socket.io Realtime Engine     |
|   - Cache-Control headers          |        |     - JWT Auth & RBAC Security      |
+------------------------------------+        +-------------------------------------+
                                                                  |
                     +--------------------------------------------+
                     |                     |                      |
                     v                     v                      v
          +--------------------+  +------------------+  +-------------------+
          |    AWS S3 Bucket   |  |   Amazon Elasti- |  |  Amazon DocumentDB|
          |  (Media & Storage) |  |   Cache (Redis)  |  |  or MongoDB Atlas |
          +--------------------+  +------------------+  +-------------------+
```

---

## 2. Local Containerization (Docker & Docker Compose)

KrishiSetu is packaged with a multi-container Docker Compose architecture that spins up the complete ecosystem:

| Service | Container Image | Port | Description |
| :--- | :--- | :--- | :--- |
| **frontend** | Custom Nginx + Vite SPA | `3000:80` | Built frontend with Nginx reverse proxy |
| **backend** | Node.js 20 Alpine | `5000:5000` | Core API server with healthcheck |
| **worker** | Node.js 20 Alpine | N/A | BullMQ queue processor for async jobs |
| **redis** | `redis:7-alpine` | `6379:6379` | In-memory cache and message queue |
| **mongodb** | `mongodb:7-jammy` | `27017:27017` | NoSQL database with persistent volume |

### Starting All Services Locally
```bash
# Build and start all 5 containers
docker compose up --build

# Run in background (detached mode)
docker compose up -d

# View real-time logs
docker compose logs -f

# Check container health status
docker compose ps

# Graceful shutdown
docker compose down
```

### Accessing Local Containers
- **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
- **Direct Mongo**: `mongodb://localhost:27017/krishisetu`

---

## 3. AWS S3 Media & Cloud Storage Integration

KrishiSetu includes a unified cloud storage pipeline in `backend/config/s3.js` and `backend/middleware/uploadMiddleware.js` powered by `@aws-sdk/client-s3`.

### S3 Configuration
Add the following keys to your `.env` or AWS Parameter Store / Secrets Manager:

```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET_NAME=krishisetu-media-assets
```

### S3 Capabilities
1. **Multipart File Uploads**: Crops, Mandi listings, logistics inspection photos, KYC documents, and dispute attachments automatically stream to S3.
2. **Pre-signed URLs**: Secure 15-minute expiring signed URLs for private dispute documents and transaction receipts.
3. **Graceful Fallback**: If AWS credentials are absent, the system automatically falls back to Cloudinary or local disk storage without crashing.

---

## 4. Option A: AWS Elastic Beanstalk (Multi-Container Docker)

KrishiSetu provides `Dockerrun.aws.json` (v2 Multi-Container format) for rapid, automated deployments on AWS Elastic Beanstalk.

### Prerequisites
- AWS CLI configured (`aws configure`)
- EB CLI installed (`pip install awsebcli`)

### Deployment Steps
```bash
# 1. Initialize Elastic Beanstalk
eb init -p "Multi-container Docker" krishisetu --region ap-south-1

# 2. Create the production environment
eb create krishisetu-prod \
  --instance-type t3.medium \
  --min-instances 2 \
  --max-instances 4 \
  --envvars NODE_ENV=production,PORT=5000

# 3. Deploy updates
eb deploy
```

---

## 5. Option B: AWS ECS Fargate & CloudFormation (Enterprise Serverless)

For high-scale production deployments with zero server management, KrishiSetu includes:
- `aws/cloudformation-template.yml`: Complete Infrastructure as Code (VPC, Subnets, ALB, Target Groups, ECS Cluster, and S3 Bucket).
- `aws/task-definition.json`: Fargate task configuration with CPU, memory, health checks, log groups, and container routing.

### Step 1: Deploy CloudFormation Stack
```bash
aws cloudformation create-stack \
  --stack-name krishisetu-infrastructure \
  --template-body file://aws/cloudformation-template.yml \
  --parameters ParameterKey=EnvironmentName,ParameterValue=prod \
  --capabilities CAPABILITY_IAM \
  --region ap-south-1
```

### Step 2: Create Amazon ECR Repositories
```bash
aws ecr create-repository --repository-name krishisetu-backend --region ap-south-1
aws ecr create-repository --repository-name krishisetu-frontend --region ap-south-1
```

### Step 3: Register Task Definition & Create Service
```bash
# Register the ECS Task Definition
aws ecs register-task-definition \
  --cli-input-json file://aws/task-definition.json \
  --region ap-south-1

# Create Fargate Service
aws ecs create-service \
  --cluster krishisetu-cluster \
  --service-name krishisetu-service \
  --task-definition krishisetu-app:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<SUBNET_1>,<SUBNET_2>],securityGroups=[<SEC_GROUP>],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=<TARGET_GROUP_ARN>,containerName=krishisetu-frontend,containerPort=80" \
  --region ap-south-1
```

---

## 6. Automated CI/CD with GitHub Actions

Automated deployments are configured in `.github/workflows/aws-deploy.yml`.

### Required GitHub Secrets
In your GitHub repository settings (`Settings -> Secrets and variables -> Actions`), add:

| Secret Name | Description |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | IAM deployment user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM deployment user secret key |

### Workflow Pipeline
Every push to `main` targeting `backend`, `frontend`, or `aws` configurations will:
1. Validate and compile the frontend (`npm run build`).
2. Authenticate to Amazon ECR.
3. Build and tag optimized Docker images.
4. Push images to Amazon ECR (`:sha` and `:latest`).
5. Update Amazon ECS task definition with the new image tags.
6. Trigger zero-downtime rolling deployment to Amazon ECS Fargate.

---

## 7. Environment Variables Reference

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Backend / Worker | `production` or `development` |
| `PORT` | Backend | Port number (default `5000`) |
| `MONGO_URI` | Backend / Worker | MongoDB connection URI |
| `REDIS_HOST` | Backend / Worker | Redis hostname (`redis` in Docker, ElastiCache in AWS) |
| `REDIS_PORT` | Backend / Worker | Redis port (default `6379`) |
| `JWT_SECRET` | Backend | Secret string for JSON Web Tokens |
| `AWS_REGION` | Backend | AWS region (e.g. `ap-south-1`) |
| `AWS_ACCESS_KEY_ID` | Backend | AWS IAM Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | Backend | AWS IAM Secret Access Key |
| `AWS_S3_BUCKET_NAME` | Backend | Amazon S3 bucket name |
| `VITE_API_URL` | Frontend | Base URL for API calls |
| `VITE_SOCKET_URL` | Frontend | Base URL for WebSockets |
