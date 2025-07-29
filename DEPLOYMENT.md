# NFT Marketplace Deployment Guide

This guide covers deploying your Solana NFT Marketplace to devnet and eventually mainnet.

## Prerequisites

1. **Solana CLI** installed and configured
2. **Anchor CLI** installed
3. **Node.js** and **npm** installed
4. A funded Solana wallet for deployment

## Step 1: Deploy Your Anchor Program

### 1.1 Build the Program
```bash
# In your Anchor program directory
anchor build
```

### 1.2 Configure Devnet
```bash
# Set Solana CLI to devnet
solana config set --url devnet

# Check your wallet balance (you'll need SOL for deployment)
solana balance

# If you need devnet SOL for testing
solana airdrop 2
```

### 1.3 Deploy to Devnet
```bash
# Deploy the program
anchor deploy --provider.cluster devnet

# Get your program ID
anchor keys list
```

**Important**: Copy the program ID from the output - you'll need it for the frontend configuration.

## Step 2: Update Frontend Configuration

### 2.1 Update Environment Variables

Replace `YourProgramIdHere` in your environment files with your actual program ID:

**.env.development**
```bash
VITE_PROGRAM_ID=Your_Actual_Program_ID_Here
```

**.env.production** (for devnet deployment)
```bash
VITE_PROGRAM_ID=Your_Actual_Program_ID_Here
```

### 2.2 Update IDL File

Replace the content of `src/idl/marketplace.json` with your actual program IDL:

```bash
# Copy your IDL from the Anchor build
cp path/to/your/anchor/project/target/idl/marketplace.json src/idl/marketplace.json
```

## Step 3: Initialize the Marketplace

After deployment, you need to initialize your marketplace:

### 3.1 Connect Wallet
1. Start your frontend application
2. Connect your wallet (the one you used for deployment)
3. Make sure you're on devnet

### 3.2 Initialize Marketplace
1. Go to the Admin Panel in your application
2. Use the "Initialize Marketplace" function
3. Set your desired marketplace fee (in basis points, e.g., 250 = 2.5%)

## Step 4: Test Your Marketplace

### 4.1 Test NFT Listing
1. Make sure you have some NFTs in your wallet
2. Try listing an NFT for sale
3. Verify the listing appears in the marketplace

### 4.2 Test NFT Purchase
1. Use a different wallet
2. Try purchasing one of your listed NFTs
3. Verify the transaction completes successfully

## Step 5: Build and Deploy Frontend

### 5.1 Build for Production
```bash
# Install dependencies
npm install

# Build the application
npm run build:production
```

### 5.2 Deploy Frontend

#### Option A: Using Docker
```bash
# Build Docker image
docker build -t nft-marketplace .

# Run container
docker run -p 80:80 nft-marketplace
```

#### Option B: Using Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Option C: Using Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## Step 6: Mainnet Deployment (When Ready)

⚠️ **Warning**: Only deploy to mainnet when you've thoroughly tested on devnet.

### 6.1 Deploy Program to Mainnet
```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Make sure you have enough SOL for deployment (more expensive than devnet)
solana balance

# Deploy
anchor deploy --provider.cluster mainnet-beta
```

### 6.2 Update Frontend for Mainnet
Update your `.env.production` file:

```bash
# Uncomment and update these lines
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_PROGRAM_ID=Your_Mainnet_Program_ID_Here
```

## Configuration Reference

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_PROGRAM_ID` | Your deployed program ID | Required |
| `VITE_MARKETPLACE_NAME` | Marketplace name for PDA | "NFT-Nexus" |
| `VITE_SOLANA_NETWORK` | Network (devnet/mainnet-beta) | devnet |
| `VITE_SOLANA_RPC_URL` | RPC endpoint URL | https://api.devnet.solana.com |
| `VITE_COMMITMENT` | Transaction commitment level | confirmed |
| `VITE_DEFAULT_COMPUTE_UNIT_LIMIT` | Compute unit limit | 200000 |
| `VITE_DEFAULT_COMPUTE_UNIT_PRICE` | Compute unit price (micro-lamports) | 1000 |
| `VITE_TRANSACTION_TIMEOUT` | Transaction timeout (ms) | 30000 |
| `VITE_MAX_RETRIES` | Maximum transaction retry attempts | 3 |

### Network Configuration

#### Devnet (Testing)
- Network: `devnet`
- RPC URL: `https://api.devnet.solana.com`
- Use for development and testing
- Free SOL available via faucet

#### Mainnet-Beta (Production)
- Network: `mainnet-beta`  
- RPC URL: `https://api.mainnet-beta.solana.com`
- Use for production deployment
- Requires real SOL for transactions

## Troubleshooting

### Common Issues

#### 1. Program ID Mismatch
**Error**: "Program ID mismatch"
**Solution**: Make sure `VITE_PROGRAM_ID` matches your deployed program ID

#### 2. Account Not Found
**Error**: "Account does not exist"
**Solution**: Initialize the marketplace first using the admin panel

#### 3. Insufficient Funds
**Error**: "Insufficient funds"
**Solution**: Ensure your wallet has enough SOL for transactions

#### 4. Transaction Timeout
**Error**: "Transaction timeout"
**Solution**: 
- Increase `VITE_TRANSACTION_TIMEOUT`
- Check network congestion
- Try higher compute unit price

#### 5. RPC Rate Limiting
**Error**: "Rate limit exceeded"
**Solution**: 
- Use a premium RPC provider (Helius, QuickNode, etc.)
- Add retry logic with delays

### Getting Help

1. Check browser console for detailed error messages
2. Verify your program is deployed correctly with `anchor keys list`
3. Test transactions on Solana Explorer
4. Check the marketplace initialization status

## Security Considerations

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive configuration
3. **Test thoroughly on devnet** before mainnet deployment
4. **Monitor transaction fees** and adjust compute budgets
5. **Use secure RPC endpoints** for production
6. **Implement proper error handling** for all user actions
7. **Validate all user inputs** before sending transactions

## Performance Optimization

1. **Use compute budgets** to optimize transaction costs
2. **Implement priority fees** during network congestion
3. **Cache frequently accessed data** (marketplace stats, listings)
4. **Use connection pooling** for RPC calls
5. **Implement pagination** for large datasets
6. **Optimize image loading** with lazy loading and CDN

## Monitoring and Maintenance

1. **Monitor transaction success rates**
2. **Track marketplace usage metrics**
3. **Keep dependencies updated**
4. **Monitor RPC endpoint health**
5. **Set up alerts for critical errors**
6. **Regular security audits**

## Next Steps

After successful deployment:
1. Set up monitoring and analytics
2. Implement additional features (auctions, offers, etc.)
3. Add more payment options
4. Integrate with popular NFT standards
5. Consider implementing a mobile app
6. Add social features and community building tools

---

Need help? Check the troubleshooting section or create an issue in the repository.