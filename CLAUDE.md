# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Solana-based NFT marketplace application built with React, TypeScript, and Vite. The application features a modern dark purple theme and is production-ready with Docker deployment support.

## Common Commands

All commands should be run from the project root directory:

```bash
# Development
npm run dev          # Start development server with host binding
npm run build        # Build for production with type checking
npm run build:production  # Full production build with linting
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues automatically
npm run type-check   # Run TypeScript type checking
npm run clean        # Clean build directory

# Package management
npm install          # Install dependencies
```

## Architecture

### Frontend Structure
- **React + TypeScript + Vite**: Modern development stack with hot reload
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Solana Wallet Adapter**: Handles wallet connections (Phantom, Solflare)
- **Anchor Framework**: TypeScript client for Solana program interaction

### Key Directories
- `src/components/`: UI components organized by feature (admin, dashboard, explore, layout, nft, portfolio, mobile)
- `src/contexts/`: React contexts for state management (MarketplaceContext, WalletContext, FavoritesContext)
- `src/hooks/`: Custom hooks, primarily `useSolanaProgram` for blockchain interaction
- `src/types/`: TypeScript interfaces for marketplace data structures

### State Management
The application uses React Context API with useReducer for state management:
- **MarketplaceContext**: Manages marketplace data, NFT listings, stats, and user portfolio
- **WalletContext**: Wraps Solana wallet providers for wallet connectivity
- **FavoritesContext**: Manages user's favorite/watchlist NFTs with localStorage persistence

### Blockchain Integration
- **Program ID**: `FvdEiEPJUEMUZ7HCkK2gPfYGFXCbUB68mTJufdC9BjC5`
- **Network**: Solana Devnet
- **Mock Implementation**: Currently uses mock data and IDL - the actual Solana program is not yet deployed
- **PDA Generation**: Uses consistent seeds for marketplace, treasury, and listing PDAs

### Component Architecture
- Components are organized by feature domains (admin, dashboard, explore, etc.)
- Common components (Button, LoadingSpinner) are in `components/common/`
- Layout components (Header, Sidebar) handle navigation and structure

## Development Notes

### Wallet Integration
The app supports Phantom and Solflare wallets through the Solana Wallet Adapter. Wallet connection is required for marketplace interactions.

### Mock Data
The MarketplaceContext currently uses mock data for development. The `refreshData` function in `src/contexts/MarketplaceContext.tsx:223` generates sample NFT listings and marketplace statistics.

### Type Definitions
All marketplace-related types are defined in `src/types/marketplace.ts`, including interfaces for Marketplace, NFTListing, NFTMetadata, UserPortfolio, and Transaction.

### Error Handling
The application uses react-hot-toast for user notifications and maintains error state in the MarketplaceContext reducer.

## Production Deployment

### Environment Configuration
- Use `.env.development` for local development
- Use `.env.production` for production deployment
- Copy `.env.example` and fill in your specific values

### Docker Deployment
```bash
# Build and run with Docker
docker build -t nft-marketplace .
docker run -p 80:80 nft-marketplace

# Or use Docker Compose
docker-compose up -d
```

### Manual Deployment
```bash
# Build for production
npm run build:production

# The `dist/` folder contains the built application
# Deploy the contents to your web server
```

## Design System

### Theme Colors
- **Primary Purple**: Shades from `primary-50` to `primary-950`
- **Dark Background**: Shades from `dark-100` to `dark-900`  
- **Accent Colors**: `accent-purple`, `accent-pink`, `accent-blue`

### CSS Classes
- `.card`: Base card styling with dark theme
- `.card-hover`: Hover effects for interactive cards
- `.btn-primary`: Primary button styling
- `.btn-secondary`: Secondary button styling
- `.input-primary`: Input field styling
- `.text-gradient`: Gradient text effect
- `.glass`: Glass morphism effect

### Mobile Optimizations
The application includes comprehensive mobile optimizations:

#### Mobile Components (`src/components/mobile/MobileOptimizations.tsx`)
- **MobileButton**: Touch-optimized buttons with proper sizing (min 44px height)
- **MobileInput**: Mobile-friendly input fields with labels and error states
- **MobileCard**: Interactive cards with touch feedback
- **MobileModal**: Full-screen and bottom-sheet modals for mobile
- **MobileTabs**: Horizontally scrollable tab navigation
- **MobileGrid**: Responsive grid system for different screen sizes

#### Mobile Hooks
- **useIsMobile()**: Detects mobile devices (< 768px width)
- **useMobileViewportHeight()**: Handles mobile viewport height issues (100vh)

#### Mobile CSS Utilities
- `.mobile-safe-area`: Safe area padding for notched devices
- `.touch-action-pan-y`: Vertical scroll optimization
- `.touch-action-manipulation`: Touch interaction optimization  
- `.tap-highlight-none`: Removes default tap highlights
- Mobile-specific animations with reduced motion support
- Webkit viewport height fixes for iOS Safari