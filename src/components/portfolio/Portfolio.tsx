import React, { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  TrendingUp, 
  Eye, 
  ShoppingBag, 
  Clock, 
  Grid, 
  List, 
  Filter, 
  Search,
  CheckSquare,
  Square,
  Edit,
  Trash2,
  Send,
  BarChart3,
  Wallet,
  History
} from 'lucide-react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { NFTCard } from '../nft/NFTCard';
import { StatsCard } from '../dashboard/StatsCard';
import { Button } from '../common/Button';
import { ListNFTModal } from '../nft/ListNFTModal';
import { NFTListing } from '../../types/marketplace';
import { PortfolioTabs } from './PortfolioTabs';

export function Portfolio() {
  const { connected } = useWallet();
  const { listings, listNFT, delistNFT } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'owned' | 'listed' | 'purchases' | 'analytics'>('owned');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNFTs, setSelectedNFTs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('newest');
  const [filterCollection, setFilterCollection] = useState('');
  const [showListModal, setShowListModal] = useState(false);
  const [nftToList, setNFTToList] = useState<NFTListing | null>(null);
  const [bulkActionMode, setBulkActionMode] = useState(false);

  if (!connected) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">
          Connect your wallet to view your NFT portfolio and trading activity.
        </p>
        <Button variant="primary">
          Connect Wallet
        </Button>
      </div>
    );
  }

  // Mock user data - replace with actual user portfolio data
  const userOwnedNFTs = listings.slice(0, 8);
  const userListedNFTs = listings.slice(8, 12);
  const userPurchases = [
    { 
      id: '1', 
      nft: listings[0], 
      purchasePrice: 2.5, 
      purchaseDate: Date.now() - 86400000, 
      seller: 'ABC...123',
      transactionHash: 'tx123...abc',
      currentValue: 3.2
    },
    { 
      id: '2', 
      nft: listings[1], 
      purchasePrice: 1.8, 
      purchaseDate: Date.now() - 172800000, 
      seller: 'DEF...456',
      transactionHash: 'tx456...def',
      currentValue: 2.1
    },
    { 
      id: '3', 
      nft: listings[2], 
      purchasePrice: 4.2, 
      purchaseDate: Date.now() - 259200000, 
      seller: 'GHI...789',
      transactionHash: 'tx789...ghi',
      currentValue: 3.8
    },
  ];

  // Get unique collections for filtering
  const uniqueCollections = useMemo(() => {
    const collections = new Set<string>();
    [...userOwnedNFTs, ...userListedNFTs].forEach(nft => {
      if (nft.metadata.collection?.name) {
        collections.add(nft.metadata.collection.name);
      }
    });
    return Array.from(collections);
  }, [userOwnedNFTs, userListedNFTs]);

  // Filter and sort NFTs
  const filteredOwnedNFTs = useMemo(() => {
    let filtered = userOwnedNFTs.filter(nft => {
      const matchesSearch = nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollection = !filterCollection || nft.metadata.collection?.name === filterCollection;
      return matchesSearch && matchesCollection;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-high': return b.price - a.price;
        case 'price-low': return a.price - b.price;
        case 'name': return a.metadata.name.localeCompare(b.metadata.name);
        case 'newest': return b.createdAt - a.createdAt;
        default: return 0;
      }
    });
  }, [userOwnedNFTs, searchTerm, filterCollection, sortBy]);

  const filteredListedNFTs = useMemo(() => {
    return userListedNFTs.filter(nft => 
      nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filterCollection || nft.metadata.collection?.name === filterCollection)
    );
  }, [userListedNFTs, searchTerm, filterCollection]);

  // Portfolio statistics
  const portfolioValue = userOwnedNFTs.reduce((sum, nft) => sum + nft.price, 0);
  const totalSpent = userPurchases.reduce((sum, purchase) => sum + purchase.purchasePrice, 0);
  const totalCurrentValue = userPurchases.reduce((sum, purchase) => sum + purchase.currentValue, 0);
  const totalPnL = totalCurrentValue - totalSpent;
  const pnlPercentage = totalSpent > 0 ? ((totalPnL / totalSpent) * 100) : 0;

  // Bulk actions
  const toggleNFTSelection = (nftId: string) => {
    const newSelected = new Set(selectedNFTs);
    if (newSelected.has(nftId)) {
      newSelected.delete(nftId);
    } else {
      newSelected.add(nftId);
    }
    setSelectedNFTs(newSelected);
  };

  const selectAllNFTs = () => {
    if (selectedNFTs.size === filteredOwnedNFTs.length) {
      setSelectedNFTs(new Set());
    } else {
      setSelectedNFTs(new Set(filteredOwnedNFTs.map(nft => nft.id)));
    }
  };

  const handleBulkList = () => {
    // Handle bulk listing logic
    console.log('Bulk list NFTs:', Array.from(selectedNFTs));
    setBulkActionMode(false);
    setSelectedNFTs(new Set());
  };

  const handleListNFT = (nft: NFTListing) => {
    setNFTToList(nft);
    setShowListModal(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Portfolio</h1>
          <p className="text-gray-400 mt-2">Manage your NFT collection and trading activity</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant={bulkActionMode ? "primary" : "secondary"} 
            onClick={() => setBulkActionMode(!bulkActionMode)}
          >
            {bulkActionMode ? 'Exit Bulk Mode' : 'Bulk Actions'}
          </Button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Portfolio Value"
          value={`${portfolioValue.toFixed(2)} SOL`}
          change={`${pnlPercentage >= 0 ? '+' : ''}${pnlPercentage.toFixed(1)}% P&L`}
          changeType={pnlPercentage >= 0 ? "positive" : "negative"}
          icon={TrendingUp}
        />
        <StatsCard
          title="Owned NFTs"
          value={userOwnedNFTs.length}
          change={`${filteredOwnedNFTs.length} visible`}
          icon={Eye}
        />
        <StatsCard
          title="Listed NFTs"
          value={userListedNFTs.length}
          change={`${filteredListedNFTs.length} active`}
          icon={ShoppingBag}
        />
        <StatsCard
          title="Total Spent"
          value={`${totalSpent.toFixed(2)} SOL`}
          change={`Current: ${totalCurrentValue.toFixed(2)} SOL`}
          changeType={totalPnL >= 0 ? "positive" : "negative"}
          icon={Wallet}
        />
      </div>

      {/* Tabs */}
      <div className="card p-0">
        <div className="border-b border-primary-800/30">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'owned', label: 'Owned NFTs', count: filteredOwnedNFTs.length, icon: Eye },
              { id: 'listed', label: 'Listed NFTs', count: filteredListedNFTs.length, icon: ShoppingBag },
              { id: 'purchases', label: 'Purchase History', count: userPurchases.length, icon: History },
              { id: 'analytics', label: 'Analytics', count: null, icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== null && <span className="text-xs">({tab.count})</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <PortfolioTabs
            activeTab={activeTab}
            filteredOwnedNFTs={filteredOwnedNFTs}
            filteredListedNFTs={filteredListedNFTs}
            userPurchases={userPurchases}
            viewMode={viewMode}
            bulkActionMode={bulkActionMode}
            selectedNFTs={selectedNFTs}
            searchTerm={searchTerm}
            sortBy={sortBy}
            filterCollection={filterCollection}
            uniqueCollections={uniqueCollections}
            onSearchChange={setSearchTerm}
            onSortChange={setSortBy}
            onFilterChange={setFilterCollection}
            onToggleSelection={toggleNFTSelection}
            onSelectAll={selectAllNFTs}
            onBulkList={handleBulkList}
            onListNFT={handleListNFT}
            onDelistNFT={delistNFT}
          />
        </div>
      </div>

      {/* List NFT Modal */}
      {showListModal && nftToList && (
        <ListNFTModal
          nft={nftToList}
          isOpen={showListModal}
          onClose={() => {
            setShowListModal(false);
            setNFTToList(null);
          }}
          onList={async (nft, price, duration) => {
            await listNFT(nft.nftMint, price);
          }}
        />
      )}
    </div>
  );
}