import React, { useState, useMemo, useCallback } from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { NFTListing } from '../../types/marketplace';
import { Button } from '../common/Button';
import { OptimizedImage } from '../common/OptimizedImage';
import { NFTDetailModal } from './NFTDetailModal';
import { useFavorites } from '../../contexts/FavoritesContext';

interface NFTCardProps {
  nft: NFTListing;
  onBuy?: (nft: NFTListing) => void;
  onList?: (nft: NFTListing) => void;
  onDelist?: (nft: NFTListing) => void;
  showActions?: boolean;
  isOwned?: boolean;
}

export const NFTCard = React.memo<NFTCardProps>(({ nft, onBuy, onList, onDelist, showActions = true, isOwned = false }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  
  // Memoize expensive computations
  const rarityAttribute = useMemo(() => 
    nft.metadata.attributes?.find(attr => attr.trait_type === 'Rarity'),
    [nft.metadata.attributes]
  );
  
  const displayAttributes = useMemo(() => 
    nft.metadata.attributes?.slice(0, 2) || [],
    [nft.metadata.attributes]
  );
  
  const isNFTFavorite = useMemo(() => 
    isFavorite(nft.id),
    [isFavorite, nft.id]
  );
  
  // Memoize event handlers
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'https://images.pexels.com/photos/4000000/pexels-photo-4000000.jpeg?auto=compress&cs=tinysrgb&w=400';
  }, []);

  const handleFavoriteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    if (isNFTFavorite) {
      removeFromFavorites(nft.id);
    } else {
      addToFavorites(nft);
    }
  }, [isNFTFavorite, removeFromFavorites, addToFavorites, nft]);
  
  const handleModalOpen = useCallback(() => {
    setShowDetailModal(true);
  }, []);
  
  const handleModalClose = useCallback(() => {
    setShowDetailModal(false);
  }, []);
  
  const handleExplorerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://explorer.solana.com/address/${nft.nftMint}?cluster=devnet`, '_blank');
  }, [nft.nftMint]);
  
  const handleBuyClick = useCallback(() => {
    onBuy?.(nft);
  }, [onBuy, nft]);
  
  const handleListClick = useCallback(() => {
    onList?.(nft);
  }, [onList, nft]);
  
  const handleDelistClick = useCallback(() => {
    onDelist?.(nft);
  }, [onDelist, nft]);

  return (
    <div className="card card-hover group animate-fade-in">
      {/* Image */}
      <div 
        className="relative aspect-square overflow-hidden rounded-t-xl cursor-pointer"
        onClick={handleModalOpen}
      >
        <OptimizedImage
          src={nft.metadata.image}
          alt={nft.metadata.name}
          className="group-hover:scale-105 transition-transform duration-300"
          width={400}
          height={400}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button 
            onClick={handleFavoriteToggle}
            className="p-2 glass rounded-full hover:bg-white/20 transition-colors"
          >
            <Heart 
              className={`h-4 w-4 transition-colors ${
                isNFTFavorite 
                  ? 'text-red-400 fill-current' 
                  : 'text-white'
              }`} 
            />
          </button>
        </div>
        
        {/* Rarity badge */}
        {rarityAttribute && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-medium rounded-lg backdrop-blur-sm border border-primary-500/30">
              {rarityAttribute.value || 'Common'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {nft.metadata.name}
            </h3>
            {nft.metadata.collection && (
              <p className="text-sm text-gray-400 truncate">
                {nft.metadata.collection.name}
              </p>
            )}
          </div>
          <button 
            className="ml-2 p-1 hover:bg-dark-300/50 rounded-lg transition-colors"
            onClick={handleExplorerClick}
            title="View on Solana Explorer"
          >
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-400">Price</p>
            <p className="text-xl font-bold text-white">
              {nft.price} <span className="text-sm font-normal text-primary-400">SOL</span>
            </p>
          </div>
        </div>

        {/* Attributes */}
        {displayAttributes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {displayAttributes.map((attr, index) => (
              <span
                key={`${attr.trait_type}-${attr.value}-${index}`}
                className="px-2 py-1 bg-primary-900/30 text-primary-300 text-xs rounded-lg border border-primary-800/30"
              >
                {attr.trait_type}: {attr.value}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2">
            {isOwned ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleListClick}
                >
                  List for Sale
                </Button>
                {onDelist && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelistClick}
                  >
                    Delist
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={handleBuyClick}
              >
                Buy Now
              </Button>
            )}
          </div>
        )}
      </div>

      {/* NFT Detail Modal */}
      <NFTDetailModal
        nft={nft}
        isOpen={showDetailModal}
        onClose={handleModalClose}
        onBuy={onBuy}
        onList={onList}
        onDelist={onDelist}
        isOwned={isOwned}
      />
    </div>
  );
});