import React from 'react';
import { Toaster } from 'react-hot-toast';

function MinimalApp() {
  return (
    <div className="min-h-screen bg-dark-gradient p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">NFT Nexus - Minimal Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <h2 className="text-green-400 font-bold mb-2">✅ Basic React App</h2>
            <p className="text-green-300">React is working properly</p>
          </div>
          
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h2 className="text-blue-400 font-bold mb-2">🎨 Tailwind CSS</h2>
            <p className="text-blue-300">Styles are loading correctly</p>
          </div>
          
          <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <h2 className="text-purple-400 font-bold mb-2">🔧 Testing Environment</h2>
            <pre className="text-purple-300 text-xs">
              {JSON.stringify({
                NODE_ENV: import.meta.env.NODE_ENV,
                VITE_PROGRAM_ID: import.meta.env.VITE_PROGRAM_ID,
                VITE_SOLANA_NETWORK: import.meta.env.VITE_SOLANA_NETWORK,
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

export default MinimalApp;