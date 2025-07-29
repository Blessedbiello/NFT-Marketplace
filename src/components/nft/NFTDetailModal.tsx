import React, { useState } from 'react';
import { X, ExternalLink, Copy, Heart, Share2, Eye, Clock, Zap } from 'lucide-react';
import { NFTListing } from '../../types/marketplace';
import { Button } from '../common/Button';
import { SocialShareButton } from '../common/SocialShare';
import { MobileModal, MobileTabs, useIsMobile } from '../mobile/MobileOptimizations';

interface NFTDetailModalProps {
  nft: NFTListing;
  isOpen: boolean;
  onClose: () => void;
  onBuy?: (nft: NFTListing) => void;
  onList?: (nft: NFTListing) => void;
  onDelist?: (nft: NFTListing) => void;
  isOwned?: boolean;
}

export function NFTDetailModal({ 
  nft, 
  isOpen, 
  onClose, 
  onBuy, 
  onList, 
  onDelist, 
  isOwned = false 
}: NFTDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'attributes' | 'history'>('details');
  const [showFullImage, setShowFullImage] = useState(false);
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const mockHistory = [
    { type: 'sale', price: 2.5, from: 'ABC...123', to: 'DEF...456', date: '2024-01-15', txHash: 'tx123...abc' },
    { type: 'list', price: 2.8, from: 'DEF...456', date: '2024-01-10', txHash: 'tx456...def' },
    { type: 'mint', from: 'Creator', to: 'ABC...123', date: '2024-01-01', txHash: 'tx789...ghi' },
  ];

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'attributes', label: 'Traits' },
    { id: 'history', label: 'History' }
  ];

  if (isMobile) {
    return (
      <MobileModal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={nft.metadata.name}
        fullScreen={true}
      >
        <div className="p-4 space-y-6">
          {/* Mobile Image */}
          <div className="aspect-square relative">
            <img
              src={nft.metadata.image}
              alt={nft.metadata.name}
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/4000000/pexels-photo-4000000.jpeg?auto=compress&cs=tinysrgb&w=800';
              }}
            />
            
            {/* Mobile Actions */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button 
                onClick={() => setShowFullImage(true)}
                className="p-2 glass rounded-full"
              >
                <Eye className="h-4 w-4 text-white" />
              </button>
              <SocialShareButton nft={nft} size="md" className="glass rounded-full" />
            </div>

            {/* Rarity Badge */}
            {nft.metadata.attributes && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium rounded-lg">
                  {nft.metadata.attributes.find(attr => attr.trait_type === 'Rarity')?.value || 'Common'}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Price & Actions */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Current Price</p>
              <p className="text-2xl font-bold text-white">
                {nft.price} <span className="text-lg text-primary-400">SOL</span>
              </p>
              <p className="text-sm text-gray-400">
                ≈ ${(nft.price * 100).toFixed(2)} USD
              </p>
            </div>
            
            <div className="flex space-x-3">
              {isOwned ? (
                <>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="flex-1"
                    onClick={() => onList && onList(nft)}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    List for Sale
                  </Button>
                  {onDelist && (
                    <Button 
                      variant="secondary" 
                      size="lg"
                      onClick={() => onDelist(nft)}
                    >
                      Delist
                    </Button>
                  )}
                </>
              ) : (
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="flex-1"
                  onClick={() => onBuy && onBuy(nft)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Tabs */}
          <MobileTabs 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as any)}
          />

          {/* Mobile Tab Content */}
          <div className="min-h-[300px]">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {nft.metadata.description || 'No description available for this NFT.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-dark-400/30 rounded-lg">
                      <span className="text-gray-400">Mint Address</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-sm">{formatAddress(nft.nftMint)}</span>
                        <button onClick={() => copyToClipboard(nft.nftMint)}>
                          <Copy className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-dark-400/30 rounded-lg">
                      <span className="text-gray-400">Owner</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-primary-400 text-sm">{formatAddress(nft.seller)}</span>
                        <button onClick={() => copyToClipboard(nft.seller)}>
                          <Copy className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attributes' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Attributes</h3>
                <div className="space-y-3">
                  {nft.metadata.attributes?.map((attr, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-dark-400/30 rounded-lg">
                      <span className="text-primary-400 text-sm font-medium uppercase tracking-wide">
                        {attr.trait_type}
                      </span>
                      <span className="text-white font-semibold">{attr.value}</span>
                    </div>
                  )) || (
                    <p className="text-gray-400 text-center py-8">No attributes available.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Transaction History</h3>
                <div className="space-y-3">
                  {mockHistory.map((tx, index) => (
                    <div key={index} className="p-4 bg-dark-400/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            tx.type === 'sale' ? 'bg-green-400' : 
                            tx.type === 'list' ? 'bg-blue-400' : 'bg-purple-400'
                          }`} />
                          <span className="text-white font-medium capitalize">{tx.type}</span>
                          {tx.price && (
                            <span className="text-primary-400 font-semibold">{tx.price} SOL</span>
                          )}
                        </div>
                        <span className="text-gray-400 text-sm">{tx.date}</span>
                      </div>
                      
                      <div className="text-sm text-gray-300 space-y-1">
                        <div className="flex justify-between">
                          <span>From:</span>
                          <span>{tx.from}</span>
                        </div>
                        {tx.to && (
                          <div className="flex justify-between">
                            <span>To:</span>
                            <span>{tx.to}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </MobileModal>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="card p-0 flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="lg:w-1/2 relative">
            <div className="aspect-square relative group">
              <img
                src={nft.metadata.image}
                alt={nft.metadata.name}
                className="w-full h-full object-cover rounded-l-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/4000000/pexels-photo-4000000.jpeg?auto=compress&cs=tinysrgb&w=800';
                }}
              />
              
              {/* Image Actions */}
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setShowFullImage(true)}
                  className="p-2 glass rounded-full hover:bg-white/20"
                >
                  <Eye className="h-4 w-4 text-white" />
                </button>
                <SocialShareButton 
                  nft={nft} 
                  size="md" 
                  className="glass rounded-full hover:bg-white/20"
                />
              </div>

              {/* Rarity Badge */}
              {nft.metadata.attributes && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-medium rounded-lg">
                    {nft.metadata.attributes.find(attr => attr.trait_type === 'Rarity')?.value || 'Common'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-primary-800/30">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">{nft.metadata.name}</h1>
                  {nft.metadata.collection && (
                    <p className="text-primary-400 text-sm">
                      Collection: {nft.metadata.collection.name}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors">
                    <Heart className="h-5 w-5 text-gray-400" />
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-dark-300/50 rounded-lg transition-colors">
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Current Price</p>
                    <p className="text-3xl font-bold text-white">
                      {nft.price} <span className="text-lg text-primary-400">SOL</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      ≈ ${(nft.price * 100).toFixed(2)} USD
                    </p>
                  </div>
                  
                  <div className="text-right text-sm">
                    <p className="text-gray-400">Owned by</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-primary-400">{formatAddress(nft.seller)}</span>
                      <button onClick={() => copyToClipboard(nft.seller)}>
                        <Copy className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {isOwned ? (
                    <>
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="flex-1"
                        onClick={() => onList && onList(nft)}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        List for Sale
                      </Button>
                      {onDelist && (
                        <Button 
                          variant="secondary" 
                          size="lg"
                          onClick={() => onDelist(nft)}
                        >
                          Delist
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="flex-1"
                      onClick={() => onBuy && onBuy(nft)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  )}
                  
                  <Button variant="secondary" size="lg">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-primary-800/30">
              {['details', 'attributes', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-primary-400 border-b-2 border-primary-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {nft.metadata.description || 'No description available for this NFT.'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mint Address</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono">{formatAddress(nft.nftMint)}</span>
                          <button onClick={() => copyToClipboard(nft.nftMint)}>
                            <Copy className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Token Standard</span>
                        <span className="text-white">Metaplex</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Listed Date</span>
                        <span className="text-white">{new Date(nft.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attributes' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Attributes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {nft.metadata.attributes?.map((attr, index) => (
                      <div key={index} className="card p-3 text-center">
                        <p className="text-primary-400 text-sm font-medium uppercase tracking-wide">
                          {attr.trait_type}
                        </p>
                        <p className="text-white font-semibold mt-1">{attr.value}</p>
                      </div>
                    )) || (
                      <p className="text-gray-400 col-span-2">No attributes available.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Transaction History</h3>
                  <div className="space-y-3">
                    {mockHistory.map((tx, index) => (
                      <div key={index} className="card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              tx.type === 'sale' ? 'bg-green-400' : 
                              tx.type === 'list' ? 'bg-blue-400' : 'bg-purple-400'
                            }`} />
                            <span className="text-white font-medium capitalize">{tx.type}</span>
                            {tx.price && (
                              <span className="text-primary-400 font-semibold">{tx.price} SOL</span>
                            )}
                          </div>
                          <span className="text-gray-400 text-sm">{tx.date}</span>
                        </div>
                        
                        <div className="text-sm text-gray-300 space-y-1">
                          <div className="flex justify-between">
                            <span>From:</span>
                            <span>{tx.from}</span>
                          </div>
                          {tx.to && (
                            <div className="flex justify-between">
                              <span>To:</span>
                              <span>{tx.to}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Transaction:</span>
                            <button 
                              onClick={() => copyToClipboard(tx.txHash)}
                              className="text-primary-400 hover:text-primary-300 flex items-center space-x-1"
                            >
                              <span>{formatAddress(tx.txHash)}</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <button 
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={nft.metadata.image} 
            alt={nft.metadata.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}