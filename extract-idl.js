// Extract IDL from deployed Solana program
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const programId = new PublicKey('FvdEiEPJUEMUZ7HCkK2gPfYGFXCbUB68mTJufdC9BjC5');

async function extractIDL() {
  try {
    console.log(`🔍 Extracting IDL from program: ${programId.toBase58()}`);
    
    // Method 1: Try to fetch IDL from program account
    console.log('\n📋 Method 1: Fetching IDL from program account...');
    
    // The IDL is usually stored at a derived address
    const IDL_SEED = Buffer.from('anchor:idl');
    const [idlAddress] = PublicKey.findProgramAddressSync([IDL_SEED, programId.toBuffer()], programId);
    
    console.log(`🎯 IDL Address: ${idlAddress.toBase58()}`);
    
    const idlAccount = await connection.getAccountInfo(idlAddress);
    
    if (idlAccount) {
      console.log(`✅ IDL account found!`);
      console.log(`   Size: ${idlAccount.data.length} bytes`);
      console.log(`   Owner: ${idlAccount.owner.toBase58()}`);
      
      // Try to parse the IDL data
      try {
        // Skip the first 8 bytes (discriminator) and next 32 bytes (authority)
        const idlData = idlAccount.data.slice(40);
        
        // The IDL is compressed with zlib
        const zlib = await import('zlib');
        const decompressed = zlib.inflateSync(idlData);
        const idlString = decompressed.toString('utf8');
        const idl = JSON.parse(idlString);
        
        console.log(`✅ Successfully extracted IDL!`);
        console.log(`   Name: ${idl.name}`);
        console.log(`   Version: ${idl.version}`);
        console.log(`   Instructions: ${idl.instructions?.length || 0}`);
        console.log(`   Accounts: ${idl.accounts?.length || 0}`);
        console.log(`   Types: ${idl.types?.length || 0}`);
        
        // Write the IDL to file
        const fs = await import('fs');
        const properIDL = {
          ...idl,
          address: programId.toBase58()
        };
        
        fs.writeFileSync('./extracted_idl.json', JSON.stringify(properIDL, null, 2));
        console.log(`📁 IDL saved to extracted_idl.json`);
        
        return properIDL;
        
      } catch (parseError) {
        console.error(`❌ Failed to parse IDL data:`, parseError);
      }
    } else {
      console.log(`❌ IDL account not found at expected address`);
    }
    
    // Method 2: Check if program account itself contains IDL
    console.log('\n📋 Method 2: Checking program account...');
    const programAccount = await connection.getAccountInfo(programId);
    
    if (programAccount) {
      console.log(`✅ Program account found!`);
      console.log(`   Size: ${programAccount.data.length} bytes`);
      console.log(`   Owner: ${programAccount.owner.toBase58()}`);
      console.log(`   Executable: ${programAccount.executable}`);
      
      if (programAccount.executable) {
        console.log(`✅ Program is executable - properly deployed`);
      } else {
        console.log(`❌ Program is not executable - deployment issue`);
      }
    } else {
      console.log(`❌ Program account not found - program may not be deployed`);
    }
    
    // Method 3: Try anchor program parsing (if we had a minimal IDL)
    console.log('\n📋 Method 3: Analyzing from instruction calls...');
    
    // Get recent transactions to analyze instruction format
    const signatures = await connection.getSignaturesForAddress(programId, { limit: 10 });
    console.log(`🔄 Found ${signatures.length} recent transactions`);
    
    for (let i = 0; i < Math.min(3, signatures.length); i++) {
      try {
        const tx = await connection.getTransaction(signatures[i].signature, {
          maxSupportedTransactionVersion: 0
        });
        
        if (tx && tx.meta && !tx.meta.err) {
          console.log(`   ✅ Transaction ${i + 1}: ${signatures[i].signature}`);
          
          // Analyze instruction data
          const instructions = tx.transaction.message.instructions;
          for (const ix of instructions) {
            if (ix.programId.equals(programId)) {
              console.log(`      📝 Instruction data length: ${ix.data.length}`);
              if (ix.data.length >= 8) {
                const discriminator = Array.from(ix.data.slice(0, 8));
                console.log(`      🎯 Discriminator: [${discriminator.join(', ')}]`);
              }
            }
          }
        }
      } catch (txError) {
        console.log(`   ❌ Failed to fetch transaction ${i + 1}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error extracting IDL:', error);
  }
}

extractIDL();