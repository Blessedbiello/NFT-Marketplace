import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Home,
  Search,
  User,
  List,
  TrendingUp,
  Settings,
  Shield,
  X,
  Heart,
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

const navigation = [
  { name: 'Dashboard', icon: Home, view: 'dashboard' },
  { name: 'Explore', icon: Search, view: 'explore' },
  { name: 'Trending', icon: TrendingUp, view: 'trending' },
];

const userNavigation = [
  { name: 'My NFTs', icon: User, view: 'my-nfts' },
  { name: 'My Listings', icon: List, view: 'my-listings' },
  { name: 'Portfolio', icon: TrendingUp, view: 'portfolio' },
  { name: 'Favorites', icon: Heart, view: 'favorites' },
];

const adminNavigation = [
  { name: 'Admin Panel', icon: Shield, view: 'admin' },
  { name: 'Settings', icon: Settings, view: 'settings' },
];

export function Sidebar({ isOpen, onClose, currentView, onViewChange }: SidebarProps) {
  const { connected } = useWallet();

  const handleNavClick = (view: string) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 glass border-r border-primary-800/30 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary-800/30 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center animate-pulse-glow">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-lg font-bold text-gradient">
                NFT Nexus
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-dark-300/50 transition-colors"
            >
              <X className="h-5 w-5 text-gray-300" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.view)}
                  className={clsx(
                    'w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    currentView === item.view
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                      : 'text-gray-300 hover:bg-dark-300/50 hover:text-primary-400'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            {/* User Navigation */}
            {connected && (
              <div className="pt-4 space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  My Account
                </h3>
                {userNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.view)}
                    className={clsx(
                      'w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      currentView === item.view
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-300 hover:bg-dark-300/50 hover:text-primary-400'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Admin Navigation */}
            {connected && (
              <div className="pt-4 space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Admin
                </h3>
                {adminNavigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.view)}
                    className={clsx(
                      'w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      currentView === item.view
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-300 hover:bg-dark-300/50 hover:text-primary-400'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}