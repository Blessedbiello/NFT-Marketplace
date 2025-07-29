import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { Marketplace, NFTListing, MarketplaceStats, UserPortfolio } from '../types/marketplace';
import { useSolanaProgram, MarketplaceAccount, ListingAccount } from '../hooks/useSolanaProgram';

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

  // Helper function to convert blockchain data to frontend types
  const convertListingToNFTListing = (listingAccount: ListingAccount, publicKey: string): NFTListing => {
    return {
      id: publicKey,
      marketplace: 'marketplace-1', // Default marketplace ID
      nftMint: listingAccount.nftMint.toBase58(),
      seller: listingAccount.maker.toBase58(),
      price: lamportsToSol(listingAccount.price),
      createdAt: Date.now(), // Use timestamp in milliseconds
      metadata: {
        name: `NFT ${publicKey.slice(0, 8)}`, // Placeholder - fetch real metadata
        description: 'NFT from Solana blockchain',
        image: `https://images.pexels.com/photos/400000${Math.floor(Math.random() * 10)}/pexels-photo-400000${Math.floor(Math.random() * 10)}.jpeg?auto=compress&cs=tinysrgb&w=800`,
        attributes: []
      }
    };
  };

  const initializeMarketplace = async (name: string, fee: number) => {
    if (!initMarketplace || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const txSignature = await initMarketplace(name, fee);
      if (txSignature) {
        toast.success('Marketplace initialized successfully!');
        await refreshData();
      }
    } catch (error: any) {
      console.error('Error initializing marketplace:', error);
      const errorMessage = error.message || 'Failed to initialize marketplace';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const listNFT = async (nftMint: string, price: number) => {
    if (!listNft || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const nftMintPubkey = new PublicKey(nftMint);
      const priceInLamports = solToLamports(price);
      
      const txSignature = await listNft(nftMintPubkey, priceInLamports);
      if (txSignature) {
        toast.success('NFT listed successfully!');
        await refreshData();
      }
    } catch (error: any) {
      console.error('Error listing NFT:', error);
      const errorMessage = error.message || 'Failed to list NFT';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
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
    // Don't try to fetch if we don't have the necessary functions or wallet isn't connected
    if (!fetchMarketplace || !fetchAllListings || !publicKey || !program) {
      console.warn('Marketplace functions or wallet not available, skipping data refresh');
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
        // Set some default stats so the UI doesn't break
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
        return;
      }

      // Fetch all listings
      console.log('Fetching all listings...');
      const listingAccounts = await fetchAllListings();
      console.log(`Found ${listingAccounts.length} listings`);
      
      const nftListings = listingAccounts.map(listingAccount => 
        convertListingToNFTListing(listingAccount, listingAccount.publicKey.toBase58())
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
      const userPortfolio: UserPortfolio = {
        ownedNFTs: [], // TODO: Fetch user's NFTs
        listedNFTs: userListings,
        totalValue: userListings.reduce((sum, listing) => sum + listing.price, 0),
        totalListings: userListings.length
      };
      dispatch({ type: 'SET_USER_PORTFOLIO', payload: userPortfolio });

      console.log('Marketplace data refresh completed successfully');

    } catch (error: any) {
      console.error('Error refreshing data:', error);
      
      // Show user-friendly error messages
      if (error.message?.includes('Account does not exist')) {
        dispatch({ type: 'SET_ERROR', payload: 'Marketplace not initialized. Please initialize the marketplace first.' });
      } else if (error.message?.includes('timeout') || error.message?.includes('fetch')) {
        dispatch({ type: 'SET_ERROR', payload: 'Network error. Please check your connection and try again.' });
      } else {
        // For other errors, still show the app but with an error message
        dispatch({ type: 'SET_ERROR', payload: `Error loading marketplace data: ${error.message}` });
        console.warn('Marketplace data unavailable, showing app with limited functionality');
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load marketplace data when wallet connects (but only if program is available)
  useEffect(() => {
    if (publicKey && connection && program) {
      console.log('Wallet and program ready, loading marketplace data...');
      // Add a delay to ensure everything is properly initialized
      const timeout = setTimeout(() => {
        refreshData().catch((error) => {
          console.warn('Failed to load marketplace data on wallet connect:', error);
          // Don't block the UI if marketplace data fails to load
          // The error is already handled in refreshData
        });
      }, 2000); // 2 second delay to ensure everything is ready
      
      return () => clearTimeout(timeout);
    } else if (!publicKey) {
      // Clear data when wallet disconnects
      console.log('Wallet disconnected, clearing marketplace data');
      dispatch({ type: 'SET_MARKETPLACE', payload: null as any });
      dispatch({ type: 'SET_LISTINGS', payload: [] });
      dispatch({ type: 'SET_STATS', payload: null as any });
      dispatch({ type: 'SET_USER_PORTFOLIO', payload: null as any });
      dispatch({ type: 'SET_ERROR', payload: null });
    } else if (publicKey && !program) {
      console.log('Wallet connected but program not ready yet...');
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