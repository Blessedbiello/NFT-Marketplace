import React, { createContext, useContext, ReactNode } from 'react';
import { Marketplace, NFTListing, MarketplaceStats, UserPortfolio } from '../types/marketplace';

interface MarketplaceState {
  marketplace: Marketplace | null;
  listings: NFTListing[];
  stats: MarketplaceStats | null;
  userPortfolio: UserPortfolio | null;
  loading: boolean;
  error: string | null;
}

interface MarketplaceContextType extends MarketplaceState {
  initializeMarketplace: (name: string, fee: number) => Promise<void>;
  listNFT: (nftMint: string, price: number) => Promise<void>;
  purchaseNFT: (listingId: string) => Promise<void>;
  delistNFT: (listingId: string) => Promise<void>;
  updateFee: (newFee: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Mock data
const mockStats: MarketplaceStats = {
  totalListings: 42,
  totalSales: 128,
  totalVolume: 1250.75,
  averagePrice: 9.77,
  uniqueOwners: 35,
  floorPrice: 2.5
};

const mockListings: NFTListing[] = [
  {
    id: 'mock-1',
    marketplace: 'mock-marketplace',
    nftMint: 'mock-mint-1',
    seller: 'mock-seller-1',
    price: 5.5,
    createdAt: Date.now() - 86400000,
    metadata: {
      name: 'Cool NFT #1',
      description: 'A really cool NFT',
      image: 'https://images.pexels.com/photos/4000001/pexels-photo-4000001.jpeg?auto=compress&cs=tinysrgb&w=800',
      attributes: [
        { trait_type: 'Rarity', value: 'Epic' },
        { trait_type: 'Background', value: 'Blue' }
      ]
    }
  },
  {
    id: 'mock-2',
    marketplace: 'mock-marketplace',
    nftMint: 'mock-mint-2',
    seller: 'mock-seller-2',
    price: 12.0,
    createdAt: Date.now() - 172800000,
    metadata: {
      name: 'Awesome NFT #2',
      description: 'An awesome digital collectible',
      image: 'https://images.pexels.com/photos/4000002/pexels-photo-4000002.jpeg?auto=compress&cs=tinysrgb&w=800',
      attributes: [
        { trait_type: 'Rarity', value: 'Legendary' },
        { trait_type: 'Background', value: 'Purple' }
      ]
    }
  }
];

const mockState: MarketplaceState = {
  marketplace: {
    id: 'mock-marketplace',
    name: 'NFT Nexus Mock',
    authority: 'mock-authority',
    fee: 2.5,
    treasury: 'mock-treasury',
    totalListings: 42,
    totalSales: 128,
    totalVolume: 1250.75,
    createdAt: new Date().toISOString()
  },
  listings: mockListings,
  stats: mockStats,
  userPortfolio: {
    ownedNFTs: [],
    listedNFTs: [],
    totalValue: 0,
    totalListings: 0
  },
  loading: false,
  error: null
};

const MockMarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MockMarketplaceProvider({ children }: { children: ReactNode }) {
  // Mock functions that just show toast messages
  const initializeMarketplace = async (name: string, fee: number) => {
    console.log('Mock: Initialize marketplace', { name, fee });
  };

  const listNFT = async (nftMint: string, price: number) => {
    console.log('Mock: List NFT', { nftMint, price });
  };

  const purchaseNFT = async (listingId: string) => {
    console.log('Mock: Purchase NFT', { listingId });
  };

  const delistNFT = async (listingId: string) => {
    console.log('Mock: Delist NFT', { listingId });
  };

  const updateFee = async (newFee: number) => {
    console.log('Mock: Update fee', { newFee });
  };

  const refreshData = async () => {
    console.log('Mock: Refresh data');
  };

  const contextValue: MarketplaceContextType = {
    ...mockState,
    initializeMarketplace,
    listNFT,
    purchaseNFT,
    delistNFT,
    updateFee,
    refreshData,
  };

  return (
    <MockMarketplaceContext.Provider value={contextValue}>
      {children}
    </MockMarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MockMarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}