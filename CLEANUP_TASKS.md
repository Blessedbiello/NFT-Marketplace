# Code Cleanup Tasks

## Immediate Actions

### 1. Remove Unused Files
- `src/App.backup.tsx`
- `src/App.minimal.tsx` 
- `src/App.safe.tsx`
- `src/components/debug/WalletDebug.tsx`
- `src/contexts/MockMarketplaceContext.tsx`

### 2. Consolidate Utilities
Create `src/utils/` directory with:
- `validation.ts` - Input validation functions
- `constants.ts` - App-wide constants
- `formatters.ts` - Number/date formatting
- `solana.ts` - Solana-specific utilities

### 3. Improve Type Safety
```typescript
// Add strict types for all contexts
interface StrictMarketplaceState {
  marketplace: Marketplace | null;
  listings: readonly NFTListing[];
  stats: MarketplaceStats | null;
  loading: boolean;
  error: MarketplaceError | null; // Use specific error type
}
```

### 4. Environment Variables Cleanup
- Remove unused environment variables
- Add validation for required env vars
- Create environment schema

### 5. Documentation
- Add JSDoc comments to complex functions
- Document component props interfaces
- Create architecture decision records (ADRs)