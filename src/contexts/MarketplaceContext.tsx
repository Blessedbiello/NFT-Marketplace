import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { Marketplace, NFTListing, MarketplaceStats, UserPortfolio } from '../types/marketplace';
import { useSolanaProgram, MarketplaceAccount, ListingAccount } from '../hooks/useSolanaProgram';
import { useTransactionRateLimit } from '../hooks/useRateLimit';
import { 
  validateNFTPrice, 
  validatePublicKey, 
  validateMarketplaceFee, 
  validateMarketplaceName,
  ValidationError 
} from '../utils/validation';
import { 
  classifyError, 
  logError, 
  formatErrorForUser,
  MarketplaceError,
  TransactionError,
  WalletConnectionError 
} from '../utils/errors';
import { TRANSACTION_SAFETY, SUCCESS_MESSAGES } from '../utils/constants';
import { getCompleteNFTMetadata, batchFetchNFTMetadata } from '../utils/metaplex';
import { fetchUserNFTs, userNFTToListing, calculatePortfolioValue } from '../utils/userNFTs';
import { fetchWalletNFTsStandalone } from '../utils/standaloneNFTFetcher';
import { 
  fallbackMarketplace, 
  fallbackStats, 
  fallbackUserPortfolio, 
  generateDemoListings,
  shouldUseFallbackMode,
  getFallbackErrorMessage 
} from '../utils/fallbackData';
import { debugConnectionState, debugError } from '../utils/debug';

interface MarketplaceState {
  marketplace: Marketplace | null;
  listings: NFTListing[];
  stats: MarketplaceStats | null;
  userPortfolio: UserPortfolio | null;
  loading: boolean;
  error: string | null;
}

type MarketplaceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MARKETPLACE'; payload: Marketplace }
  | { type: 'SET_LISTINGS'; payload: NFTListing[] }
  | { type: 'SET_STATS'; payload: MarketplaceStats }
  | { type: 'SET_USER_PORTFOLIO'; payload: UserPortfolio }
  | { type: 'ADD_LISTING'; payload: NFTListing }
  | { type: 'REMOVE_LISTING'; payload: string }
  | { type: 'UPDATE_LISTING'; payload: NFTListing };

const initialState: MarketplaceState = {
  marketplace: null,
  listings: [],
  stats: null,
  userPortfolio: null,
  loading: false,
  error: null,
};

function marketplaceReducer(state: MarketplaceState, action: MarketplaceAction): MarketplaceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_MARKETPLACE':
      return { ...state, marketplace: action.payload };
    case 'SET_LISTINGS':
      return { ...state, listings: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_USER_PORTFOLIO':
      return { ...state, userPortfolio: action.payload };
    case 'ADD_LISTING':
      return { ...state, listings: [...state.listings, action.payload] };
    case 'REMOVE_LISTING':
      return { 
        ...state, 
        listings: state.listings.filter(listing => listing.id !== action.payload) 
      };
    case 'UPDATE_LISTING':
      return {
        ...state,
        listings: state.listings.map(listing =>
          listing.id === action.payload.id ? action.payload : listing
        ),
      };
    default:
      return state;
  }
}

interface MarketplaceContextType extends MarketplaceState {
  initializeMarketplace: (name: string, fee: number) => Promise<void>;
  listNFT: (nftMint: string, price: number) => Promise<void>;
  purchaseNFT: (listingId: string) => Promise<void>;
  delistNFT: (listingId: string) => Promise<void>;
  updateFee: (newFee: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(marketplaceReducer, initialState);
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  
  // Rate limiting for transactions
  const transactionRateLimit = useTransactionRateLimit();
  
  // Use useSolanaProgram hook safely
  const solanaProgram = useSolanaProgram();
  
  const {
    program,
    initializeMarketplace: initMarketplace,
    listNft,
    purchaseNft,
    delistNft,
    updateMarketplaceFee,
    fetchMarketplace,
    fetchAllListings,
    fetchListing,
    lamportsToSol,
    solToLamports
  } = solanaProgram;

  // Helper function to convert blockchain data to frontend types with real metadata
  const convertListingToNFTListing = async (
    listingAccount: ListingAccount, 
    publicKey: string,
    metadataMap?: Map<string, { onChain: any; json: any }>
  ): Promise<NFTListing> => {
    const mintString = listingAccount.nftMint.toBase58();
    
    // Try to get metadata from cache first
    let metadata = metadataMap?.get(mintString);
    
    // If not in cache, fetch it
    if (!metadata) {
      try {
        metadata = await getCompleteNFTMetadata(connection, listingAccount.nftMint);
      } catch (error) {
        console.warn(`Failed to fetch metadata for ${mintString}:`, error);
      }
    }

    return {
      id: publicKey,
      marketplace: 'marketplace-1',
      nftMint: mintString,
      seller: listingAccount.maker.toBase58(),
      price: lamportsToSol(listingAccount.price),
      createdAt: Date.now(), // TODO: Get actual creation timestamp from events
      metadata: metadata?.json || {
        name: `NFT ${publicKey.slice(0, 8)}`,
        description: 'NFT metadata unavailable',
        image: '', // No fallback image for now
        attributes: []
      }
    };
  };

  // Secure transaction wrapper
  const executeTransaction = async <T,>(
    operation: () => Promise<T>,
    operationName: string,
    successMessage: string
  ): Promise<T | null> => {
    // Check wallet connection
    if (!publicKey) {
      const error = new WalletConnectionError();
      logError(error, operationName);
      toast.error(formatErrorForUser(error));
      throw error;
    }

    // Check rate limit
    if (!transactionRateLimit.canMakeCall()) {
      const timeUntilReset = transactionRateLimit.getTimeUntilReset();
      const error = new MarketplaceError(
        `Too many transactions. Please wait ${Math.ceil(timeUntilReset / 1000)} seconds.`,
        'RATE_LIMIT_ERROR'
      );
      logError(error, operationName);
      toast.error(formatErrorForUser(error));
      throw error;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Record the transaction attempt
      transactionRateLimit.recordCall();

      // Execute with timeout
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Transaction timeout')), TRANSACTION_SAFETY.TIMEOUT_MS)
      );

      const result = await Promise.race([operation(), timeoutPromise]);

      // Success
      toast.success(successMessage);
      await refreshData();
      return result;

    } catch (error: any) {
      const marketplaceError = classifyError(error);
      logError(marketplaceError, operationName);
      
      const userMessage = formatErrorForUser(marketplaceError);
      dispatch({ type: 'SET_ERROR', payload: userMessage });
      toast.error(userMessage);
      
      throw marketplaceError;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const initializeMarketplace = async (name: string, fee: number) => {
    try {
      // Validate inputs
      validateMarketplaceName(name);
      validateMarketplaceFee(fee);

      if (!initMarketplace) {
        console.error('❌ Marketplace initialization function not available');
        console.error('Program status:', { program, initMarketplace });
        toast.error('Program not initialized. Please refresh the page and ensure your wallet is connected.');
        throw new Error('Marketplace initialization function not available - program not ready');
      }

      console.log('🚀 Starting marketplace initialization...', { name, fee });

      await executeTransaction(
        () => initMarketplace(name, fee),
        'initializeMarketplace',
        SUCCESS_MESSAGES.MARKETPLACE_INITIALIZED
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        toast.error(error.message);
        logError(error, 'initializeMarketplace');
      }
      // Other errors are handled by executeTransaction
    }
  };

  const listNFT = async (nftMint: string, price: number) => {
    try {
      // Validate inputs
      validatePublicKey(nftMint);
      validateNFTPrice(price);

      if (!listNft) {
        throw new Error('NFT listing function not available');
      }

      await executeTransaction(
        async () => {
          const nftMintPubkey = new PublicKey(nftMint);
          const priceInLamports = solToLamports(price);
          return await listNft(nftMintPubkey, priceInLamports);
        },
        'listNFT',
        SUCCESS_MESSAGES.NFT_LISTED
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        toast.error(error.message);
        logError(error, 'listNFT');
      }
      // Other errors are handled by executeTransaction
    }
  };

  const purchaseNFT = async (listingId: string) => {
    if (!purchaseNft || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Find the listing to get mint and seller info
      const listing = state.listings.find(l => l.id === listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      const nftMintPubkey = new PublicKey(listing.nftMint);
      const sellerPubkey = new PublicKey(listing.seller);
      
      const txSignature = await purchaseNft(nftMintPubkey, sellerPubkey);
      if (txSignature) {
        toast.success('NFT purchased successfully!');
        await refreshData();
      }
    } catch (error: any) {
      console.error('Error purchasing NFT:', error);
      const errorMessage = error.message || 'Failed to purchase NFT';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const delistNFT = async (listingId: string) => {
    if (!delistNft || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Find the listing to get mint info
      const listing = state.listings.find(l => l.id === listingId);
      if (!listing) {
        throw new Error('Listing not found');
      }

      const nftMintPubkey = new PublicKey(listing.nftMint);
      
      const txSignature = await delistNft(nftMintPubkey);
      if (txSignature) {
        toast.success('NFT delisted successfully!');
        await refreshData();
      }
    } catch (error: any) {
      console.error('Error delisting NFT:', error);
      const errorMessage = error.message || 'Failed to delist NFT';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateFee = async (newFee: number) => {
    if (!updateMarketplaceFee || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const txSignature = await updateMarketplaceFee(newFee);
      if (txSignature) {
        toast.success('Marketplace fee updated successfully!');
        await refreshData();
      }
    } catch (error: any) {
      console.error('Error updating fee:', error);
      const errorMessage = error.message || 'Failed to update marketplace fee';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshData = async () => {
    // Check if we have program functions available
    const hasProgramFunctions = fetchMarketplace && fetchAllListings && program;
    
    if (!publicKey) {
      console.warn('Wallet not connected, skipping data refresh');
      return;
    }

    // If program functions are not available, use standalone NFT fetching
    if (!hasProgramFunctions) {
      console.log('🔄 Program functions not available, using standalone NFT fetching...');
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Use standalone NFT fetcher
        const userNFTs = await fetchWalletNFTsStandalone(
          publicKey.toBase58(),
          connection.rpcEndpoint
        );
        
        // Convert to NFTListing format for consistent display
        const ownedNFTListings = userNFTs.map(nft => 
          userNFTToListing(nft, publicKey.toBase58())
        );
        
        // Set user portfolio with fetched NFTs
        const userPortfolio: UserPortfolio = {
          ownedNFTs: ownedNFTListings,
          listedNFTs: [], // No marketplace listings available without program
          totalValue: 0, // Can't calculate without listings
          totalListings: 0
        };
        
        dispatch({ type: 'SET_USER_PORTFOLIO', payload: userPortfolio });
        
        // Set basic stats
        const defaultStats: MarketplaceStats = {
          totalListings: 0,
          totalSales: 0,
          totalVolume: 0,
          averagePrice: 0,
          uniqueOwners: 0,
          floorPrice: 0
        };
        dispatch({ type: 'SET_STATS', payload: defaultStats });
        dispatch({ type: 'SET_LISTINGS', payload: [] });
        
        console.log(`✅ Standalone mode: Found ${userNFTs.length} NFTs in wallet`);
        
      } catch (error) {
        console.error('❌ Standalone NFT fetching failed:', error);
        dispatch({ type: 'SET_ERROR', payload: `Failed to fetch NFTs: ${error.message}` });
        
        // Set empty state
        dispatch({ type: 'SET_STATS', payload: {
          totalListings: 0,
          totalSales: 0,
          totalVolume: 0,
          averagePrice: 0,
          uniqueOwners: 0,
          floorPrice: 0
        } as MarketplaceStats });
        dispatch({ type: 'SET_LISTINGS', payload: [] });
        dispatch({ type: 'SET_USER_PORTFOLIO', payload: {
          ownedNFTs: [],
          listedNFTs: [],
          totalValue: 0,
          totalListings: 0
        } as UserPortfolio });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('Fetching marketplace data...');
      
      // First try to fetch marketplace account
      const marketplaceData = await fetchMarketplace();
      if (marketplaceData) {
        const marketplace: Marketplace = {
          id: 'marketplace-1',
          name: marketplaceData.name,
          authority: marketplaceData.authority.toBase58(),
          fee: marketplaceData.feeBps / 100, // Convert basis points to percentage
          treasury: marketplaceData.treasury.toBase58(),
          totalListings: 0, // Not tracked in the marketplace account
          totalSales: 0, // Not tracked in the marketplace account
          totalVolume: 0, // Not tracked in the marketplace account
          createdAt: new Date().toISOString() // Placeholder
        };
        dispatch({ type: 'SET_MARKETPLACE', payload: marketplace });
        console.log('Marketplace data fetched successfully');
      } else {
        console.log('Marketplace account not found - may need to be initialized');
        // Create empty marketplace for UI but still continue to load listings/portfolio
        const emptyMarketplace: Marketplace = {
          id: 'marketplace-not-initialized',
          name: 'Marketplace (Not Initialized)',
          authority: publicKey.toBase58(),
          fee: 2.5,
          treasury: publicKey.toBase58(),
          totalListings: 0,
          totalSales: 0,
          totalVolume: 0,
          createdAt: new Date().toISOString()
        };
        dispatch({ type: 'SET_MARKETPLACE', payload: emptyMarketplace });
      }

      // Fetch all listings
      console.log('Fetching all listings...');
      const listingAccounts = await fetchAllListings();
      console.log(`Found ${listingAccounts.length} listings`);
      
      // Batch fetch NFT metadata for better performance
      const nftMints = listingAccounts.map(listing => listing.nftMint);
      console.log('Fetching NFT metadata...');
      const metadataMap = await batchFetchNFTMetadata(connection, nftMints);
      console.log(`Fetched metadata for ${metadataMap.size} NFTs`);
      
      // Convert listings with real metadata
      const nftListings = await Promise.all(
        listingAccounts.map(listingAccount => 
          convertListingToNFTListing(
            listingAccount, 
            listingAccount.publicKey.toBase58(),
            metadataMap
          )
        )
      );
      dispatch({ type: 'SET_LISTINGS', payload: nftListings });

      // Calculate stats from listings
      const totalVolume = listingAccounts.reduce((sum, listing) => sum + lamportsToSol(listing.price), 0);
      const stats: MarketplaceStats = {
        totalListings: listingAccounts.length,
        totalSales: 0, // Not tracked - would need event listening
        totalVolume: totalVolume,
        averagePrice: listingAccounts.length > 0 ? totalVolume / listingAccounts.length : 0,
        uniqueOwners: new Set(listingAccounts.map(listing => listing.maker.toBase58())).size,
        floorPrice: listingAccounts.length > 0 ? Math.min(...listingAccounts.map(listing => lamportsToSol(listing.price))) : 0
      };
      dispatch({ type: 'SET_STATS', payload: stats });

      // Update user portfolio if wallet is connected
      const userListings = nftListings.filter(listing => listing.seller === publicKey.toBase58());
      
      // Fetch user's owned NFTs (with timeout and error handling)
      let ownedNFTListings: NFTListing[] = [];
      try {
        console.log('Fetching user NFTs...');
        
        // Set a timeout for user NFT fetching to prevent hanging
        const userNFTsPromise = fetchUserNFTs(connection, publicKey);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('User NFT fetch timeout')), 15000)
        );
        
        const userNFTs = await Promise.race([userNFTsPromise, timeoutPromise]);
        console.log(`Found ${userNFTs.length} owned NFTs`);
        
        // Convert to NFTListing format for consistent display
        ownedNFTListings = userNFTs.map(nft => 
          userNFTToListing(nft, publicKey.toBase58())
        );
      } catch (error) {
        console.warn('Failed to fetch user NFTs, continuing without them:', error);
        ownedNFTListings = [];
      }
      
      // Calculate total portfolio value
      const totalValue = userListings.reduce((sum, listing) => sum + listing.price, 0);
      
      const userPortfolio: UserPortfolio = {
        ownedNFTs: ownedNFTListings,
        listedNFTs: userListings,
        totalValue: totalValue,
        totalListings: userListings.length
      };
      dispatch({ type: 'SET_USER_PORTFOLIO', payload: userPortfolio });

      console.log('Marketplace data refresh completed successfully');

    } catch (error: any) {
      console.error('Error refreshing data:', error);
      
      // For real mode, show actual errors instead of fallback
      console.log('Real mode enabled - showing actual blockchain errors');
      
      if (error.message?.includes('Account does not exist')) {
        dispatch({ type: 'SET_ERROR', payload: 'Marketplace not initialized. Please go to Admin panel and click "Initialize Marketplace".' });
        // Set empty data but no fallback
        dispatch({ type: 'SET_STATS', payload: fallbackStats });
        dispatch({ type: 'SET_LISTINGS', payload: [] });
        dispatch({ type: 'SET_USER_PORTFOLIO', payload: fallbackUserPortfolio });
      } else if (error.message?.includes('timeout') || error.message?.includes('fetch')) {
        dispatch({ type: 'SET_ERROR', payload: 'Network error. Please check your connection and try again.' });
        dispatch({ type: 'SET_STATS', payload: fallbackStats });
        dispatch({ type: 'SET_LISTINGS', payload: [] });
        dispatch({ type: 'SET_USER_PORTFOLIO', payload: fallbackUserPortfolio });
      } else {
        // Show real error for debugging
        dispatch({ type: 'SET_ERROR', payload: `Blockchain Error: ${error.message}` });
        dispatch({ type: 'SET_STATS', payload: fallbackStats });
        dispatch({ type: 'SET_LISTINGS', payload: [] });
        dispatch({ type: 'SET_USER_PORTFOLIO', payload: fallbackUserPortfolio });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load fallback data when the program is not available
  const loadFallbackData = () => {
    console.log('Loading fallback demo data...');
    
    dispatch({ type: 'SET_MARKETPLACE', payload: fallbackMarketplace });
    dispatch({ type: 'SET_STATS', payload: fallbackStats });
    dispatch({ type: 'SET_LISTINGS', payload: generateDemoListings() });
    dispatch({ type: 'SET_USER_PORTFOLIO', payload: fallbackUserPortfolio });
  };

  // Load marketplace data when wallet connects (but only if program is available)
  useEffect(() => {
    if (publicKey && connection && program) {
      console.log('Wallet and program ready, loading marketplace data...');
      debugConnectionState(connection, publicKey, program);
      // Reduce delay and show immediate feedback
      const timeout = setTimeout(() => {
        refreshData().catch((error) => {
          debugError(error, 'refreshData on wallet connect');
          console.warn('Failed to load marketplace data on wallet connect:', error);
          // Real mode - show actual error
          dispatch({ type: 'SET_ERROR', payload: error.message?.includes('Account does not exist') 
            ? 'Marketplace not initialized. Please go to Admin panel and initialize it.'
            : `Failed to load marketplace data: ${error.message}`
          });
        });
      }, 500); // Reduced to 500ms delay
      
      return () => clearTimeout(timeout);
    } else if (!publicKey) {
      // Clear data when wallet disconnects
      console.log('Wallet disconnected, clearing marketplace data');
      dispatch({ type: 'SET_MARKETPLACE', payload: null as any });
      dispatch({ type: 'SET_LISTINGS', payload: [] });
      dispatch({ type: 'SET_STATS', payload: null as any });
      dispatch({ type: 'SET_USER_PORTFOLIO', payload: null as any });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_LOADING', payload: false });
    } else if (publicKey && !program) {
      console.log('Wallet connected but program not ready yet...');
      // Set a shorter timeout for program loading
      const timeout = setTimeout(() => {
        if (!program) {
          console.log('Program not available - real mode error');
          dispatch({ type: 'SET_ERROR', payload: 'Unable to connect to marketplace program. Check your wallet connection and network.' });
          dispatch({ type: 'SET_LOADING', payload: false });
          // Set empty state
          dispatch({ type: 'SET_STATS', payload: fallbackStats });
          dispatch({ type: 'SET_LISTINGS', payload: [] });
          dispatch({ type: 'SET_USER_PORTFOLIO', payload: fallbackUserPortfolio });
        }
      }, 3000); // Reduced to 3 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [publicKey, connection, program]);

  const contextValue: MarketplaceContextType = {
    ...state,
    initializeMarketplace,
    listNFT,
    purchaseNFT,
    delistNFT,
    updateFee,
    refreshData,
  };

  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}