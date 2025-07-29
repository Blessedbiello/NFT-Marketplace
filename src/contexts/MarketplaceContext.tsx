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
  } = useSolanaProgram();

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
    if (!fetchMarketplace || !fetchAllListings) {
      console.warn('Marketplace functions not available');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      // Fetch marketplace data with timeout
      const marketplaceData = await Promise.race([
        fetchMarketplace(),
        timeoutPromise
      ]) as any;
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

        // Calculate stats from listings since marketplace doesn't track these
        const listings = await Promise.race([
          fetchAllListings(),
          timeoutPromise
        ]) as any;
        const totalVolume = listings.reduce((sum, listing) => sum + lamportsToSol(listing.price), 0);
        const stats: MarketplaceStats = {
          totalListings: listings.length,
          totalSales: 0, // Not tracked - would need event listening
          totalVolume: totalVolume,
          averagePrice: listings.length > 0 ? totalVolume / listings.length : 0,
          uniqueOwners: new Set(listings.map(listing => listing.maker.toBase58())).size,
          floorPrice: listings.length > 0 ? Math.min(...listings.map(listing => lamportsToSol(listing.price))) : 0
        };
        dispatch({ type: 'SET_STATS', payload: stats });
      }

      // Fetch all listings (already fetched above for stats)
      const listingAccounts = await fetchAllListings();
      const nftListings = listingAccounts.map(listingAccount => 
        convertListingToNFTListing(listingAccount, listingAccount.publicKey.toBase58())
      );
      dispatch({ type: 'SET_LISTINGS', payload: nftListings });

      // Update user portfolio if wallet is connected
      if (publicKey) {
        const userListings = nftListings.filter(listing => listing.seller === publicKey.toBase58());
        const userPortfolio: UserPortfolio = {
          ownedNFTs: [], // TODO: Fetch user's NFTs
          listedNFTs: userListings,
          totalValue: userListings.reduce((sum, listing) => sum + listing.price, 0),
          totalListings: userListings.length
        };
        dispatch({ type: 'SET_USER_PORTFOLIO', payload: userPortfolio });
      }

    } catch (error: any) {
      console.error('Error refreshing data:', error);
      const errorMessage = error.message || 'Failed to refresh marketplace data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // If marketplace doesn't exist, show helpful message
      if (error.message?.includes('Account does not exist')) {
        dispatch({ type: 'SET_ERROR', payload: 'Marketplace not initialized. Please initialize the marketplace first.' });
      } else if (error.message?.includes('timeout')) {
        dispatch({ type: 'SET_ERROR', payload: 'Network timeout. Please check your connection and try again.' });
      } else {
        // Still show the app even if marketplace data fails to load
        console.warn('Marketplace data unavailable, showing app without blockchain data');
        dispatch({ type: 'SET_ERROR', payload: null });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load marketplace data when wallet connects
  useEffect(() => {
    if (publicKey && connection) {
      console.log('Wallet connected, loading marketplace data...');
      // Add a small delay to ensure wallet is fully connected
      const timeout = setTimeout(() => {
        refreshData().catch((error) => {
          console.warn('Failed to load marketplace data on wallet connect:', error);
          // Don't block the UI if marketplace data fails to load
          // Just show a warning toast
          if (!error.message?.includes('timeout')) {
            toast.error('Failed to load marketplace data. Some features may be limited.');
          }
        });
      }, 1000); // Increased delay to 1 second
      
      return () => clearTimeout(timeout);
    } else if (!publicKey) {
      // Clear data when wallet disconnects
      dispatch({ type: 'SET_MARKETPLACE', payload: null as any });
      dispatch({ type: 'SET_LISTINGS', payload: [] });
      dispatch({ type: 'SET_STATS', payload: null as any });
      dispatch({ type: 'SET_USER_PORTFOLIO', payload: null as any });
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, [publicKey, connection]);

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