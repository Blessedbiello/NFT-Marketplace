import React, { useState, useEffect } from 'react';
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
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
    toast.error('App crashed. Please refresh the page.');
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-gray-300 mb-6">The application encountered an error. Please refresh the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return (this.props as any).children;
  }
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [appError, setAppError] = useState<string | null>(null);
  const { connected, connecting, disconnecting } = useWallet();
  
  // Initialize mobile viewport height
  useMobileViewportHeight();

  // Debug wallet connection state
  useEffect(() => {
    console.log('Wallet state changed:', { connected, connecting, disconnecting });
    if (connecting) {
      console.log('Wallet is connecting...');
    }
    if (connected) {
      console.log('Wallet connected successfully');
    }
  }, [connected, connecting, disconnecting]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'explore':
      case 'trending':
        return <Explore onViewChange={setCurrentView} />;
      case 'my-nfts':
      case 'my-listings':
      case 'portfolio':
        return <Portfolio onViewChange={setCurrentView} />;
      case 'favorites':
        return <Favorites onViewChange={setCurrentView} />;
      case 'admin':
      case 'settings':
        return <AdminPanel onViewChange={setCurrentView} />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  // Show loading state during wallet connection
  if (connecting) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting wallet...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WalletContextProvider>
        <MarketplaceProvider>
          <FavoritesProvider>
            <AppContent />
          </FavoritesProvider>
        </MarketplaceProvider>
      </WalletContextProvider>
    </ErrorBoundary>
  );
}

export default App;