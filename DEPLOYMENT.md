# Deployment Guide - Vercel

This guide covers deploying the Solana NFT Marketplace to Vercel.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy Button (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/nft-marketplace&env=VITE_PROGRAM_ID,VITE_SOLANA_NETWORK,VITE_MARKETPLACE_NAME&envDescription=Solana%20program%20configuration&envLink=https://github.com/your-username/nft-marketplace%23environment-variables)

### Option 2: Manual Deployment

1. **Fork/Clone the repository**
2. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## ⚙️ Environment Variables

Configure these in your Vercel dashboard under **Settings > Environment Variables**:

### Required Variables
```env
VITE_PROGRAM_ID=FvdEiEPJUEMUZ7HCkK2gPfYGFXCbUB68mTJufdC9BjC5
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_MARKETPLACE_NAME=NFT-Nexus
VITE_DEFAULT_FEE_BPS=250
```

### Optional Performance Variables
```env
VITE_COMMITMENT=confirmed
VITE_PREFLIGHT_COMMITMENT=confirmed
VITE_DEFAULT_COMPUTE_UNIT_LIMIT=400000
VITE_TRANSACTION_TIMEOUT=60000
VITE_MAX_RETRIES=5
```

## 🔧 Vercel Configuration

The `vercel.json` file is pre-configured with:

- **Framework**: Vite detection
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Routing**: Proper rewrites for client-side routing
- **Security Headers**: CSP, XSS protection, etc.
- **Caching**: Optimized static asset caching
- **Region**: US East (iad1) for optimal performance

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Build passes locally (`npm run build`)
- [ ] TypeScript checks pass (`npm run type-check`)
- [ ] Solana program deployed and verified

### Post-Deployment
- [ ] Test wallet connection
- [ ] Verify marketplace functionality
- [ ] Check responsive design
- [ ] Test on multiple devices/browsers
- [ ] Monitor performance and errors

## 🚨 Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json .vercel
npm install
vercel --prod
```

### Environment Variable Issues
1. Check variable names match exactly (case-sensitive)
2. Ensure all required variables are set
3. Verify RPC URL is accessible
4. Check program ID is correct

### Performance Issues
1. Enable Edge Functions if needed
2. Optimize images and assets
3. Check bundle size with `npm run build -- --report`
4. Monitor Core Web Vitals in Vercel Analytics

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Solana RPC Endpoints](https://docs.solana.com/cluster/rpc-endpoints)

## 📊 Post-Deployment Monitoring

### Vercel Analytics
Enable in Vercel dashboard for:
- Performance metrics
- User analytics
- Error tracking
- Core Web Vitals

### Recommended Monitoring
- **Uptime**: Monitor marketplace availability
- **Performance**: Track loading times
- **Errors**: Monitor blockchain transaction failures
- **Usage**: Track marketplace activity

---

Your Solana NFT Marketplace will be live at: `https://your-project.vercel.app`