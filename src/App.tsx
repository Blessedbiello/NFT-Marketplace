import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { WalletContextProvider } from './contexts/WalletContext';
import { MarketplaceProvider } from './contexts/MarketplaceContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { Explore } from './components/explore/Explore';
import { Portfolio } from './components/portfolio/Portfolio';
import { AdminPanel } from './components/admin/AdminPanel';
import { Favorites } from './components/favorites/Favorites';
import { useMobileViewportHeight } from './components/mobile/MobileOptimizations';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Initialize mobile viewport height
  useMobileViewportHeight();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'explore':
      case 'trending':
        return <Explore />;
      case 'my-nfts':
      case 'my-listings':
      case 'portfolio':
        return <Portfolio />;
      case 'favorites':
        return <Favorites />;
      case 'admin':
      case 'settings':
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <WalletContextProvider>
      <MarketplaceProvider>
        <FavoritesProvider>
          <div className="min-h-screen bg-dark-gradient mobile-safe-area">
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          
          <div className="flex">
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              currentView={currentView}
              onViewChange={setCurrentView}
            />
            
            <main className="flex-1 p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {renderCurrentView()}
              </div>
            </main>
          </div>

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1837',
                color: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #7c3aed',
                boxShadow: '0 10px 15px -3px rgba(168, 85, 247, 0.3), 0 4px 6px -2px rgba(168, 85, 247, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#a855f7',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          </div>
        </FavoritesProvider>
      </MarketplaceProvider>
    </WalletContextProvider>
  );
}

export default App;