// Debug script to test metadata parsing for the specific NFT
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const nftMint = '5Kd27uW62wfAVk54fD4JVr1HTJGeV6sXVuiXfzxxZx5m';
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

async function debugMetadata() {
  try {
    console.log(`🔍 Debugging metadata for NFT: ${nftMint}`);
    
    const mintPubkey = new PublicKey(nftMint);
    
    // Get metadata PDA
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()],
      METADATA_PROGRAM_ID
    );
    
    console.log(`📍 Metadata PDA: ${metadataPDA.toBase58()}`);
    
    // Fetch metadata account
    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    if (!metadataAccount) {
      console.log('❌ No metadata account found');
      return;
    }
    
    console.log(`✅ Metadata account found`);
    console.log(`   Owner: ${metadataAccount.owner.toBase58()}`);
    console.log(`   Size: ${metadataAccount.data.length} bytes`);
    console.log(`   Executable: ${metadataAccount.executable}`);
    console.log(`   Rent Epoch: ${metadataAccount.rentEpoch}`);
    
    // Try to parse metadata manually (without Metaplex library)
    console.log('\n🔧 Attempting manual metadata parsing...');
    
    // The first 1 byte is the account discriminator
    // Next 32 bytes is update authority
    // Next 32 bytes is mint
    // Then comes the Data struct
    
    const data = metadataAccount.data;
    console.log(`   First 10 bytes: ${Array.from(data.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
    
    // Skip discriminator (1 byte)
    let offset = 1;
    
    // Update authority (32 bytes)
    const updateAuthority = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    console.log(`   Update Authority: ${updateAuthority.toBase58()}`);
    
    // Mint (32 bytes)
    const mint = new PublicKey(data.slice(offset, offset + 32));
    offset += 32;
    console.log(`   Mint: ${mint.toBase58()}`);
    
    // Data struct starts here
    // Name length (4 bytes, little endian)
    const nameLength = data.readUInt32LE(offset);
    offset += 4;
    console.log(`   Name length: ${nameLength}`);
    
    if (nameLength > 0 && nameLength < 200) { // Sanity check
      const nameBytes = data.slice(offset, offset + nameLength);
      const name = nameBytes.toString('utf8').replace(/\0/g, '').trim();
      offset += nameLength;
      console.log(`   Name: "${name}"`);
      
      // Symbol length (4 bytes)
      const symbolLength = data.readUInt32LE(offset);
      offset += 4;
      console.log(`   Symbol length: ${symbolLength}`);
      
      if (symbolLength > 0 && symbolLength < 50) {
        const symbolBytes = data.slice(offset, offset + symbolLength);
        const symbol = symbolBytes.toString('utf8').replace(/\0/g, '').trim();
        offset += symbolLength;
        console.log(`   Symbol: "${symbol}"`);
        
        // URI length (4 bytes)
        const uriLength = data.readUInt32LE(offset);
        offset += 4;
        console.log(`   URI length: ${uriLength}`);
        
        if (uriLength > 0 && uriLength < 1000) {
          const uriBytes = data.slice(offset, offset + uriLength);
          const uri = uriBytes.toString('utf8').replace(/\0/g, '').trim();
          console.log(`   URI: "${uri}"`);
          
          // Try to fetch JSON metadata
          console.log('\n🌐 Fetching JSON metadata...');
          try {
            let fetchUrl = uri;
            if (uri.startsWith('ipfs://')) {
              fetchUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
            
            console.log(`   Fetch URL: ${fetchUrl}`);
            
            const response = await fetch(fetchUrl);
            console.log(`   HTTP Status: ${response.status}`);
            
            if (response.ok) {
              const jsonMetadata = await response.json();
              console.log(`   JSON Name: "${jsonMetadata.name}"`);
              console.log(`   JSON Description: "${jsonMetadata.description}"`);
              console.log(`   JSON Image: "${jsonMetadata.image}"`);
              console.log(`   JSON Attributes: ${JSON.stringify(jsonMetadata.attributes || [])}`);
              
              console.log('\n✅ Successfully parsed complete NFT metadata!');
            } else {
              console.log(`   ❌ Failed to fetch JSON: ${response.statusText}`);
            }
          } catch (fetchError) {
            console.log(`   ❌ JSON fetch error: ${fetchError.message}`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugMetadata();