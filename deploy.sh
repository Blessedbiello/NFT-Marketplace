#!/bin/bash

# Solana NFT Marketplace - Vercel Deployment Script
set -e

echo "🚀 Deploying Solana NFT Marketplace to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Are you in the project root?${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Run pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Type check
echo -e "${BLUE}  Checking TypeScript...${NC}"
npm run type-check
echo -e "${GREEN}  ✅ TypeScript check passed${NC}"

# Build check
echo -e "${BLUE}  Testing build...${NC}"
npm run build > /dev/null 2>&1
echo -e "${GREEN}  ✅ Build successful${NC}"

# Clean up test build
rm -rf dist

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found. Creating from template...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env.production
        echo -e "${YELLOW}📝 Please update .env.production with your values${NC}"
    fi
fi

# Deploy
if [ "$1" = "preview" ]; then
    echo -e "${BLUE}🔍 Creating preview deployment...${NC}"
    vercel
else
    echo -e "${BLUE}🌟 Creating production deployment...${NC}"
    vercel --prod
fi

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${BLUE}📊 Monitor your deployment at: https://vercel.com/dashboard${NC}"
echo -e "${BLUE}📖 Check deployment guide: ./DEPLOYMENT.md${NC}"

# Post-deployment checklist
echo -e "${YELLOW}"
echo "📋 Post-Deployment Checklist:"
echo "  • Test wallet connection on deployed site"
echo "  • Verify environment variables in Vercel dashboard"
echo "  • Check marketplace functionality"
echo "  • Test responsive design on mobile devices"
echo "  • Monitor performance with Vercel Analytics"
echo -e "${NC}"