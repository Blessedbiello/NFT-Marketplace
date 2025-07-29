import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export function WalletDebug() {
  try {
    console.log('WalletDebug component rendering...');
    
    const walletState = useWallet();
    console.log('Wallet state:', walletState);
    
    return (
      <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
        <h3 className="text-green-400 font-bold mb-2">Wallet Debug</h3>
        <pre className="text-xs text-green-300">
          {JSON.stringify({
            connected: walletState.connected,
            connecting: walletState.connecting,
            disconnecting: walletState.disconnecting,
            publicKey: walletState.publicKey?.toBase58(),
          }, null, 2)}
        </pre>
      </div>
    );
  } catch (error: any) {
    console.error('WalletDebug error:', error);
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <h3 className="text-red-400 font-bold mb-2">Wallet Debug Error</h3>
        <p className="text-red-300 text-sm">{error.message}</p>
      </div>
    );
  }
}