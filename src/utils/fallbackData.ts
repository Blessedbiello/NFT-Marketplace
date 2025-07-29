import type { Marketplace, NFTListing, MarketplaceStats, UserPortfolio } from '../types/marketplace';

// Fallback marketplace data when the program account doesn't exist
export const fallbackMarketplace: Marketplace = {
  id: 'fallback-marketplace',
  name: 'NFT Marketplace (Demo Mode)',
  authority: '11111111111111111111111111111112',
  fee: 2.5,
  treasury: '11111111111111111111111111111112',
  totalListings: 0,
  totalSales: 0,
  totalVolume: 0,
  createdAt: new Date().toISOString(),
};

// Fallback stats
export const fallbackStats: MarketplaceStats = {
  totalListings: 0,
  totalSales: 0,
  totalVolume: 0,
  averagePrice: 0,
  uniqueOwners: 0,
  floorPrice: 0,
};

// Fallback user portfolio
export const fallbackUserPortfolio: UserPortfolio = {
  ownedNFTs: [],
  listedNFTs: [],
  totalValue: 0,
  totalListings: 0,
};

// Demo NFT listings for when there are no real listings
export const generateDemoListings = (): NFTListing[] => {
  const demoArt = [
    {
      name: "Cosmic Wanderer #1",
      description: "A vibrant digital artwork exploring the cosmos",
      image: "https://picsum.photos/400/400?random=1",
      attributes: [
        { trait_type: "Background", value: "Nebula" },
        { trait_type: "Eyes", value: "Stellar" },
        { trait_type: "Rarity", value: "Rare" }
      ]
    },
    {
      name: "Digital Bloom #42",
      description: "Nature meets technology in this stunning piece",
      image: "https://picsum.photos/400/400?random=2",
      attributes: [
        { trait_type: "Background", value: "Forest" },
        { trait_type: "Type", value: "Botanical" },
        { trait_type: "Rarity", value: "Common" }
      ]
    },
    {
      name: "Neon Dreams #888",
      description: "Retro-futuristic art with a modern twist",
      image: "https://picsum.photos/400/400?random=3",
      attributes: [
        { trait_type: "Background", value: "Neon" },
        { trait_type: "Style", value: "Cyberpunk" },
        { trait_type: "Rarity", value: "Legendary" }
      ]
    }
  ];

  return demoArt.map((art, index) => ({
    id: `demo-${index + 1}`,
    marketplace: 'fallback-marketplace',
    nftMint: `demo-mint-${index + 1}`,
    seller: '11111111111111111111111111111112',
    price: Math.random() * 5 + 0.5, // Random price between 0.5 and 5.5 SOL
    createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time in last week
    metadata: art
  }));
};

// Check if we're in fallback mode (program not deployed or account doesn't exist)
export const shouldUseFallbackMode = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  
  return (
    errorMessage.includes('account does not exist') ||
    errorMessage.includes('program account not found') ||
    errorMessage.includes('invalid program id') ||
    errorMessage.includes('transaction simulation failed') ||
    errorMessage.includes('program not deployed')
  );
};

// Get appropriate error message for fallback mode
export const getFallbackErrorMessage = (): string => {
  return "Marketplace program not found. Running in demo mode. To use full functionality, please deploy the Solana program first.";
};