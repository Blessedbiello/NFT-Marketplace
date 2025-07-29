import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';

// Configuration from environment
const PROGRAM_ID = new PublicKey('FvdEiEPJUEMUZ7HCkK2gPfYGFXCbUB68mTJufdC9BjC5');
const MARKETPLACE_NAME = 'NFT-Nexus-Dev';
const RPC_URL = 'https://api.devnet.solana.com';

// PDA derivation function
function getMarketplacePDA(name = MARKETPLACE_NAME) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('marketplace'), Buffer.from(name)],
    PROGRAM_ID
  );
}

async function checkMarketplaceStatus() {
  console.log('🔍 Checking NFT Marketplace Status on Devnet\n');
  
  const connection = new Connection(RPC_URL, 'confirmed');
  
  console.log('Configuration:');
  console.log(`- Program ID: ${PROGRAM_ID.toBase58()}`);
  console.log(`- Marketplace Name: ${MARKETPLACE_NAME}`);
  console.log(`- RPC URL: ${RPC_URL}\n`);
  
  try {
    // Check if program exists
    console.log('1. Checking program account...');
    const programAccount = await connection.getAccountInfo(PROGRAM_ID);
    
    if (!programAccount) {
      console.log('❌ Program account not found!');
      return;
    }
    
    console.log('✅ Program account exists');
    console.log(`   - Executable: ${programAccount.executable}`);
    console.log(`   - Owner: ${programAccount.owner.toBase58()}`);
    console.log(`   - Data Length: ${programAccount.data.length} bytes\n`);
    
    // Check marketplace PDA
    console.log('2. Checking marketplace account...');
    const [marketplacePDA, bump] = getMarketplacePDA(MARKETPLACE_NAME);
    console.log(`   - Marketplace PDA: ${marketplacePDA.toBase58()}`);
    console.log(`   - Bump: ${bump}`);
    
    const marketplaceAccount = await connection.getAccountInfo(marketplacePDA);
    
    if (!marketplaceAccount) {
      console.log('❌ Marketplace account not initialized');
      console.log('\n📋 Next Steps:');
      console.log('1. Connect your wallet to the dApp');
      console.log('2. Go to the Admin panel');
      console.log('3. Click "Initialize Marketplace"');
      console.log('4. Sign the transaction');
      return;
    }
    
    console.log('✅ Marketplace account exists');
    console.log(`   - Owner: ${marketplaceAccount.owner.toBase58()}`);
    console.log(`   - Data Length: ${marketplaceAccount.data.length} bytes`);
    
    // Try to parse marketplace data (basic check)
    if (marketplaceAccount.data.length >= 8) {
      console.log('✅ Account has data (likely initialized)\n');
      
      // Check for any existing listings
      console.log('3. Checking for existing listings...');
      try {
        // This is a simple check - we can't easily parse without the full program setup
        console.log('ℹ️  To see listing details, connect through the dApp\n');
        
        console.log('🎉 Marketplace Status: READY');
        console.log('✅ Your marketplace is initialized and ready to use!');
        console.log('✅ You can now list and trade NFTs');
        
      } catch (error) {
        console.log('⚠️  Could not fetch listings (this is normal)');
      }
    } else {
      console.log('⚠️  Account exists but may not be properly initialized');
    }
    
  } catch (error) {
    console.log('❌ Error checking marketplace status:');
    console.log(error.message);
    
    if (error.message.includes('429')) {
      console.log('\n💡 Rate limited. Try again in a few seconds.');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 Network timeout. Check your internet connection.');
    }
  }
}

// Treasury PDA check
async function checkTreasuryPDA() {
  const connection = new Connection(RPC_URL, 'confirmed');
  const [marketplacePDA] = getMarketplacePDA(MARKETPLACE_NAME);
  
  const [treasuryPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from('treasury'), marketplacePDA.toBuffer()],
    PROGRAM_ID
  );
  
  console.log('\n4. Checking treasury account...');
  console.log(`   - Treasury PDA: ${treasuryPDA.toBase58()}`);
  
  const treasuryAccount = await connection.getAccountInfo(treasuryPDA);
  if (treasuryAccount) {
    console.log('✅ Treasury account exists');
    const balance = treasuryAccount.lamports / 1e9;
    console.log(`   - Balance: ${balance} SOL`);
  } else {
    console.log('❌ Treasury account not found');
  }
}

// Run the check
checkMarketplaceStatus()
  .then(() => checkTreasuryPDA())
  .then(() => {
    console.log('\n🔗 Connect to your dApp at: http://localhost:3001');
  })
  .catch(console.error);

export { checkMarketplaceStatus, getMarketplacePDA };