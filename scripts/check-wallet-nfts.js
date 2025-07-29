import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Configuration
const RPC_URL = 'https://api.devnet.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

// Replace with your wallet address
const WALLET_ADDRESS = process.argv[2];

if (!WALLET_ADDRESS) {
  console.log('Usage: node scripts/check-wallet-nfts.js <WALLET_ADDRESS>');
  console.log('Example: node scripts/check-wallet-nfts.js 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
  process.exit(1);
}

async function checkWalletNFTs() {
  try {
    console.log('🔍 Checking NFTs in wallet...\n');
    console.log(`Wallet: ${WALLET_ADDRESS}`);
    console.log(`Network: Devnet\n`);

    const userPublicKey = new PublicKey(WALLET_ADDRESS);

    // Check SOL balance first
    const balance = await connection.getBalance(userPublicKey);
    console.log(`💰 SOL Balance: ${balance / 1e9} SOL\n`);

    // Get all token accounts
    console.log('📋 Fetching all token accounts...');
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      userPublicKey,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );

    console.log(`Found ${tokenAccounts.value.length} total token accounts\n`);

    if (tokenAccounts.value.length === 0) {
      console.log('❌ No token accounts found. This wallet has no tokens or NFTs.');
      return;
    }

    // Analyze all token accounts
    console.log('📊 Token Account Analysis:');
    console.log('─'.repeat(80));

    let nftCount = 0;
    let fungibleCount = 0;

    for (let i = 0; i < tokenAccounts.value.length; i++) {
      const account = tokenAccounts.value[i];
      const tokenInfo = account.account.data.parsed.info;
      
      const mint = tokenInfo.mint;
      const amount = tokenInfo.tokenAmount.amount;
      const decimals = tokenInfo.tokenAmount.decimals;
      const uiAmount = tokenInfo.tokenAmount.uiAmount;

      console.log(`\n${i + 1}. Token Account: ${account.pubkey.toBase58()}`);
      console.log(`   Mint: ${mint}`);
      console.log(`   Amount: ${amount} (UI: ${uiAmount})`);
      console.log(`   Decimals: ${decimals}`);

      // Check if it's a potential NFT
      if (amount === '1' && decimals === 0) {
        console.log(`   🎨 POTENTIAL NFT ✅`);
        nftCount++;

        // Try to check for metadata account
        try {
          const mintPubkey = new PublicKey(mint);
          const [metadataPDA] = await PublicKey.findProgramAddress(
            [
              Buffer.from('metadata'),
              new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
              mintPubkey.toBuffer(),
            ],
            new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
          );

          const metadataAccount = await connection.getAccountInfo(metadataPDA);
          if (metadataAccount) {
            console.log(`   📄 Metadata account exists: ${metadataPDA.toBase58()}`);
            console.log(`   📏 Metadata size: ${metadataAccount.data.length} bytes`);
          } else {
            console.log(`   ⚠️  No metadata account found (not a standard NFT)`);
          }
        } catch (error) {
          console.log(`   ❌ Error checking metadata: ${error.message}`);
        }
      } else {
        console.log(`   💰 FUNGIBLE TOKEN`);
        fungibleCount++;
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('📈 SUMMARY:');
    console.log(`🎨 Potential NFTs: ${nftCount}`);
    console.log(`💰 Fungible tokens: ${fungibleCount}`);
    console.log(`📊 Total accounts: ${tokenAccounts.value.length}`);

    if (nftCount === 0) {
      console.log('\n❌ No NFTs found in this wallet.');
      console.log('\n💡 To test the NFT marketplace:');
      console.log('1. Go to a devnet NFT faucet like https://spl-token-faucet.com');
      console.log('2. Or mint some test NFTs on devnet');
      console.log('3. Or use a different wallet that has NFTs');
    } else {
      console.log(`\n✅ Found ${nftCount} potential NFT(s) in wallet!`);
      console.log('   Your NFT marketplace should be able to display these.');
    }

  } catch (error) {
    console.error('❌ Error checking wallet NFTs:', error.message);
    
    if (error.message.includes('Invalid public key')) {
      console.log('\n💡 Make sure you provided a valid Solana wallet address.');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Rate limited. Try again in a few seconds.');
    }
  }
}

// Run the check
checkWalletNFTs();