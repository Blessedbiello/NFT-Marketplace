// Debug script to test NFT fetching for specific wallet
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const walletAddress = 'trCJczPeU7VbziS2r1mfMfpAuFABEJQjvinnwRndh5C';

async function debugNFTFetching() {
  try {
    console.log(`🔍 Debugging NFT fetching for wallet: ${walletAddress}`);
    console.log(`🌐 RPC Endpoint: ${connection.rpcEndpoint}`);
    
    const userPublicKey = new PublicKey(walletAddress);
    
    // Test 1: Check RPC connection
    console.log('\n📡 Testing RPC connection...');
    const slot = await connection.getSlot();
    console.log(`✅ Current slot: ${slot}`);
    
    // Test 2: Get wallet balance
    const balance = await connection.getBalance(userPublicKey);
    console.log(`💰 Wallet balance: ${balance / 1e9} SOL`);
    
    // Test 3: Get all token accounts
    console.log('\n📋 Fetching all token accounts...');
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userPublicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    console.log(`📊 Found ${tokenAccounts.value.length} total token accounts`);
    
    if (tokenAccounts.value.length === 0) {
      console.log('❌ No token accounts found - wallet might be empty or on wrong network');
      return;
    }
    
    // Test 4: Analyze each token account
    console.log('\n🔍 Analyzing token accounts:');
    for (let i = 0; i < tokenAccounts.value.length; i++) {
      const account = tokenAccounts.value[i];
      const tokenInfo = account.account.data.parsed.info;
      
      console.log(`\n[${i + 1}/${tokenAccounts.value.length}] Token Account: ${account.pubkey.toBase58()}`);
      console.log(`   Mint: ${tokenInfo.mint}`);
      console.log(`   Amount: ${tokenInfo.tokenAmount.amount}`);
      console.log(`   Decimals: ${tokenInfo.tokenAmount.decimals}`);
      console.log(`   UI Amount: ${tokenInfo.tokenAmount.uiAmount}`);
      
      // Check if this looks like an NFT
      const isNFTLike = tokenInfo.tokenAmount.amount === '1' && tokenInfo.tokenAmount.decimals === 0;
      console.log(`   Is NFT-like: ${isNFTLike ? '✅' : '❌'}`);
      
      if (isNFTLike) {
        // Test metadata account existence
        const mintPubkey = new PublicKey(tokenInfo.mint);
        const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
        
        const [metadataPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
          METADATA_PROGRAM_ID
        );
        
        console.log(`   Metadata PDA: ${metadataPDA.toBase58()}`);
        
        try {
          const metadataAccount = await connection.getAccountInfo(metadataPDA);
          console.log(`   Metadata account exists: ${metadataAccount ? '✅' : '❌'}`);
          
          if (metadataAccount) {
            console.log(`   Metadata size: ${metadataAccount.data.length} bytes`);
            console.log(`   Owner: ${metadataAccount.owner.toBase58()}`);
          }
        } catch (error) {
          console.log(`   Metadata check error: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugNFTFetching();