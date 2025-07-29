# Solana NFT Marketplace

![My Image](./img2.png)

A decentralized NFT marketplace built on Solana blockchain with modern React frontend and Anchor smart contracts. Features a sleek dark purple theme, mobile-responsive design, and comprehensive marketplace functionality.

## 🚀 Features

### Core Marketplace Features
- **NFT Listing & Trading**: List, buy, sell, and delist NFTs with dynamic pricing
- **Marketplace Management**: Admin controls for fees, authority management, and rate limiting
- **Real-time Data**: Live blockchain data fetching with automatic updates
- **Portfolio Management**: Track owned NFTs, listings, and transaction history
- **Favorites System**: Save and manage favorite NFTs with local storage persistence

### Technical Features
- **Solana Integration**: Full Anchor program integration with PDA derivation
- **Wallet Support**: Phantom, Solflare, and other Solana wallets
- **Mobile Optimized**: Responsive design with touch-friendly interactions
- **Type Safety**: Full TypeScript implementation with IDL-generated types
- **Error Handling**: Comprehensive error management and user feedback
- **Production Ready**: Docker deployment with Nginx optimization

## 🏗 Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling with custom design system
- **Solana Wallet Adapter** for seamless wallet integration
- **Anchor Framework** for TypeScript client generation

### Smart Contract
- **Program ID**: `FvdEiEPJUEMUZ7HCkK2gPfYGFXCbUB68mTJufdC9BjC5`
- **Network**: Solana Devnet
- **Framework**: Anchor (Rust-based)
- **Features**: Marketplace initialization, NFT listing/delisting, purchases with fees

### State Management
- **React Context API** with useReducer for marketplace state
- **Local Storage** for favorites and user preferences
- **Real-time Updates** through blockchain event monitoring

## 📋 Prerequisites

Before running the application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Solana Wallet** (Phantom recommended)
- **Docker** (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd NFT-Marketplace
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the environment template and configure your settings:

```bash
cp .env.example .env.development
```

Edit `.env.development` with your configuration:
```env
# Solana Configuration
VITE_PROGRAM_ID=FvdEiEPJUEMUZ7HCkK2gPfYGFXCbUB68mTJufdC9BjC5
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Marketplace Configuration
VITE_MARKETPLACE_NAME=NFT-Nexus
VITE_DEFAULT_FEE_BPS=250

# Transaction Configuration
VITE_COMMITMENT=confirmed
VITE_PREFLIGHT_COMMITMENT=confirmed
VITE_SKIP_PREFLIGHT=false
VITE_DEFAULT_COMPUTE_UNIT_LIMIT=200000
VITE_DEFAULT_COMPUTE_UNIT_PRICE=1000
VITE_TRANSACTION_TIMEOUT=30000
VITE_MAX_RETRIES=3
```

### 4. Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📝 Available Scripts

### Development
```bash
npm run dev          # Start development server with host binding
npm run build        # Build for production with type checking
npm run build:production  # Full production build with linting
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues automatically
npm run type-check   # Run TypeScript type checking
npm run clean        # Clean build directory
```

## 🐳 Docker Deployment

### Development
```bash
docker build -t nft-marketplace .
docker run -p 80:80 nft-marketplace
```

### Production with Docker Compose
```bash
# Configure production environment
cp .env.example .env.production

# Start the application
docker-compose up -d
```

The application will be available at `http://localhost`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_PROGRAM_ID` | Solana program address | `FvdEiEPJUEMUZ7HCkK2gPfYGFXCbUB68mTJufdC9BjC5` |
| `VITE_SOLANA_NETWORK` | Solana network (devnet/mainnet-beta) | `devnet` |
| `VITE_MARKETPLACE_NAME` | Marketplace identifier | `NFT-Nexus` |
| `VITE_DEFAULT_FEE_BPS` | Default marketplace fee (basis points) | `250` |
| `VITE_COMMITMENT` | Transaction commitment level | `confirmed` |

### Marketplace Configuration

#### Fee Structure
- **Marketplace Fee**: 2.5% (250 basis points) by default
- **Configurable**: Admin can update fees through the interface
- **Creator Royalties**: Automatically honored from NFT metadata

#### Rate Limiting
- **Configurable**: Admin-controlled rate limiting for marketplace operations
- **Default**: No rate limiting (0 interval)

## 🎨 Design System

### Color Palette
- **Primary Purple**: `#9333ea` to `#3b0764` (9 shades)
- **Dark Background**: `#1e1b4b` to `#050505` (9 shades)
- **Accent Colors**: Purple (`#8b5cf6`), Pink (`#ec4899`), Blue (`#3b82f6`)

### Component Library
- **Cards**: Glass morphism with hover effects
- **Buttons**: Gradient primary and subtle secondary styles
- **Inputs**: Dark theme with purple accent focus states
- **Mobile Components**: Touch-optimized with proper sizing

## 📱 Mobile Optimization

### Features
- **Responsive Design**: Adapts to all screen sizes
- **Touch Interactions**: Optimized button sizes (min 44px)
- **Safe Areas**: Proper handling of device notches
- **Viewport Fixes**: iOS Safari height issues resolved
- **Performance**: Reduced animations on mobile for battery savings

### Mobile Components
- `MobileButton`, `MobileInput`, `MobileCard`
- `MobileModal`, `MobileTabs`, `MobileGrid`
- Touch-optimized navigation and interactions

## 🔐 Security Features

### Smart Contract Security
- **PDA Validation**: Proper Program Derived Address verification
- **Authority Checks**: Multi-level permission system
- **Rate Limiting**: Configurable transaction rate limits
- **Reentrancy Protection**: Built into Anchor framework

### Frontend Security
- **Input Validation**: All user inputs sanitized
- **Transaction Verification**: Signature validation before processing
- **Error Handling**: No sensitive data exposure in error messages
- **Wallet Security**: Secure wallet adapter integration

## 🚨 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
npm run build
```

#### Wallet Connection Issues
1. Ensure wallet extension is installed and enabled
2. Check network settings (Devnet for development)
3. Verify sufficient SOL balance for transactions
4. Clear browser cache if persistent issues

#### Transaction Failures
1. **Insufficient Balance**: Ensure wallet has enough SOL
2. **Network Issues**: Check Solana network status
3. **Program Errors**: Check browser console for detailed error messages
4. **Rate Limiting**: Wait and retry if rate limited

### Development Issues

#### Type Errors
```bash
# Regenerate types from IDL
npm run type-check
```

#### Styling Issues
```bash
# Rebuild Tailwind CSS
npm run build
```

## 📖 API Reference

### Core Hooks

#### `useSolanaProgram()`
Main hook for interacting with the Solana program.

```typescript
const {
  // Core objects
  program,
  provider,
  programId,
  
  // Program instructions
  initializeMarketplace,
  listNft,
  purchaseNft,
  delistNft,
  updateMarketplaceFee,
  updateAuthority,
  
  // Data fetching
  fetchMarketplace,
  fetchListing,
  fetchAllListings,
  
  // Utilities
  lamportsToSol,
  solToLamports
} = useSolanaProgram();
```

#### `useMarketplace()`
Context hook for marketplace state management.

```typescript
const {
  // State
  marketplace,
  listings,
  stats,
  userPortfolio,
  loading,
  error,
  
  // Actions
  initializeMarketplace,
  listNFT,
  purchaseNFT,
  delistNFT,
  updateFee,
  refreshData
} = useMarketplace();
```

### Program Instructions

#### Initialize Marketplace
```typescript
await initializeMarketplace("MyMarketplace", 250); // 2.5% fee
```

#### List NFT
```typescript
await listNFT(nftMintAddress, priceInSOL);
```

#### Purchase NFT
```typescript
await purchaseNFT(listingId);
```

## 🧪 Testing

### Manual Testing Checklist

#### Wallet Integration
- [ ] Connect/disconnect wallet
- [ ] Switch networks
- [ ] Handle insufficient balance

#### Marketplace Operations
- [ ] Initialize marketplace (admin only)
- [ ] List NFT with various prices
- [ ] Purchase listed NFT
- [ ] Delist own NFT
- [ ] Update marketplace fees (admin only)

#### UI/UX Testing
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Dark theme consistency
- [ ] Loading states and error handling
- [ ] Favorites functionality

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Test thoroughly on Devnet
5. Update documentation as needed
6. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: Follow configured rules
- **Prettier**: Code formatting enforced
- **Conventional Commits**: Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Solana Program**: `FvdEiEPJUEMUZ7HCkK2gPfYGFXCbUB68mTJufdC9BjC5`
- **Solana Explorer**: [View on Solana Explorer](https://explorer.solana.com/address/FvdEiEPJUEMUZ7HCkK2gPfYGFXCbUB68mTJufdC9BjC5?cluster=devnet)
- **Anchor Documentation**: [anchor-lang.com](https://anchor-lang.com)
- **Solana Documentation**: [docs.solana.com](https://docs.solana.com)

## 🙏 Acknowledgments

- **Solana Foundation** for the robust blockchain infrastructure
- **Anchor Framework** for simplified Solana development
- **React Team** for the excellent frontend framework
- **Tailwind CSS** for the utility-first styling approach

---

Built with ❤️ on Solana blockchain
