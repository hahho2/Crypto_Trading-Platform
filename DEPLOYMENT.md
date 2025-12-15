# NovaTrade Vercel Deployment Guide

This configuration deploys the React frontend to Vercel while proxying API calls to your backend server.

## Prerequisites

1. **Backend Deployment**: Deploy your Spring Boot backend to a cloud provider:
   - Heroku (recommended)
   - Railway
   - DigitalOcean App Platform
   - AWS Elastic Beanstalk

2. **Update Configuration**: 
   - Replace `https://your-backend-api.herokuapp.com` in `vercel.json` with your actual backend URL
   - Update `REACT_APP_API_URL` in `frontend/.env.production`

## Deployment Steps

### 1. Connect Repository
```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy from repository root
vercel
```

### 2. Configure Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_NAME=NovaTrade
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
CI=true
```

### 3. Custom Domain (Optional)
- Add your domain in Vercel Dashboard
- Update CORS settings in your backend to allow your domain

## File Structure

```
vercel.json           # Vercel configuration
.vercelignore         # Files to exclude from deployment
frontend/
├── .env.production   # Production environment variables
├── .env.development  # Development environment variables
├── package.json      # Dependencies and build scripts
└── src/config/api.ts # API configuration with environment support
```

## Configuration Details

### vercel.json
- **Builds**: Configures React app build using `@vercel/static-build`
- **Routes**: Proxies `/api/*` and `/auth/*` to backend, serves SPA for other routes
- **Headers**: Security headers and caching for static assets
- **Environment**: Sets production environment variables

### API Proxying
All API calls (`/api/*`, `/auth/*`) are automatically forwarded to your backend server with proper CORS headers.

### Static File Caching
Static assets are cached for 1 year for optimal performance.

## Troubleshooting

### Build Errors
- Ensure all dependencies in `frontend/package.json` are properly listed
- Check that environment variables are set in Vercel dashboard

### API Connection Issues
- Verify backend URL in `vercel.json` routes
- Check CORS configuration in backend allows your Vercel domain
- Ensure backend is deployed and accessible

### 404 Errors
- SPA routing is handled by the catch-all rule in `vercel.json`
- Ensure React Router is properly configured

## Backend Deployment Options

### Option 1: Heroku
```bash
# From project root
heroku create your-app-name-backend
git subtree push --prefix=src heroku master
```

### Option 2: Railway
1. Connect GitHub repository
2. Select root directory
3. Set build command: `./mvnw clean package -DskipTests`
4. Set start command: `java -jar target/*.jar`

### Option 3: DigitalOcean App Platform
1. Create new app from GitHub
2. Configure build: `./mvnw clean package -DskipTests`
3. Configure run: `java -jar target/*.jar`

## Environment Variables for Backend
Ensure your backend has these environment variables:
- `CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app`
- Database connection strings
- JWT secrets
- Third-party API keys (Razorpay, etc.)