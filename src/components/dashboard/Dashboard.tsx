import React from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, Star } from 'lucide-react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { StatsCard } from './StatsCard';
import { NFTCard } from '../nft/NFTCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function Dashboard() {
  const { stats, listings, loading, purchaseNFT } = useMarketplace();

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const featuredNFTs = listings.slice(0, 8);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-accent-purple rounded-3xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-pink/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-slide-up">
            Discover, Collect, and Trade <span className="text-gradient">NFTs</span>
          </h1>
          <p className="text-gray-200 text-lg mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
            The premier Solana marketplace for digital collectibles. 
            Explore unique artworks and join a vibrant community of creators and collectors.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <button className="btn-primary px-6 py-3">
              Explore NFTs
            </button>
            <button className="btn-secondary border-2 border-white/30 hover:border-white/50 px-6 py-3">
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Volume"
            value={`${stats.totalVolume.toLocaleString()} SOL`}
            change="+12.5% from last week"
            changeType="positive"
            icon={DollarSign}
          />
          <StatsCard
            title="Total Listings"
            value={stats.totalListings.toLocaleString()}
            change="+5.2% from last week"
            changeType="positive"
            icon={ShoppingBag}
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            change="+8.1% from last week"
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Floor Price"
            value={`${stats.floorPrice} SOL`}
            change="-2.3% from last week"
            changeType="negative"
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Featured Collections */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Featured NFTs</h2>
          <button className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            View All →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredNFTs.map((nft) => (
            <NFTCard
              key={nft.id}
              nft={nft}
              onBuy={purchaseNFT}
            />
          ))}
        </div>
      </div>

      {/* Trending Collections */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Trending Collections</h2>
          <button className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            View All →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card card-hover p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-purple rounded-2xl flex items-center justify-center animate-pulse-glow">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Cool Collection #{i}</h3>
                  <p className="text-sm text-gray-400">by Artist {i}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Floor</p>
                  <p className="text-lg font-semibold text-primary-400">{(Math.random() * 5 + 0.1).toFixed(1)} SOL</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Volume</p>
                  <p className="text-lg font-semibold text-primary-400">{(Math.random() * 1000 + 100).toFixed(0)} SOL</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Items</p>
                  <p className="text-lg font-semibold text-white">{Math.floor(Math.random() * 9000 + 1000)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}