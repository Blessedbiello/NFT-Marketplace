// Debug script to check NFTs in wallet
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function debugWalletNFTs(walletAddress) {
  try {
    const publicKey = new PublicKey(walletAddress);
    console.log(`🔍 Checking wallet: ${walletAddress}`);
    console.log(`🌐 RPC: ${connection.rpcEndpoint}`);
    
    // Get all token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    console.log(`📋 Total token accounts: ${tokenAccounts.value.length}`);
    
    // Filter for potential NFTs
    const potentialNFTs = tokenAccounts.value.filter(account => {
      const tokenInfo = account.account.data.parsed.info;
      const amount = tokenInfo.tokenAmount.amount;
      const decimals = tokenInfo.tokenAmount.decimals;
      
      console.log(`Token ${tokenInfo.mint}: amount=${amount}, decimals=${decimals}`);
      
      return amount === '1' && decimals === 0;
    });
    
    console.log(`🎨 Potential NFTs found: ${potentialNFTs.length}`);
    
    // List all potential NFT mints
    potentialNFTs.forEach((account, index) => {
      const tokenInfo = account.account.data.parsed.info;
      console.log(`  ${index + 1}. Mint: ${tokenInfo.mint}`);
    });
    
    if (potentialNFTs.length === 0) {
      console.log('❌ No potential NFTs found. This could mean:');
      console.log('   - You have no NFTs in this wallet');
      console.log('   - You\'re on the wrong network (check if wallet is on devnet)');
      console.log('   - Your NFTs are not standard Metaplex NFTs');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Replace with your wallet address
const walletAddress = process.argv[2];

if (!walletAddress) {
  console.log('Usage: node debug-wallet-nfts.js <YOUR_WALLET_ADDRESS>');
  console.log('Example: node debug-wallet-nfts.js 7k8J9...your-wallet-address');
} else {
  debugWalletNFTs(walletAddress);
}