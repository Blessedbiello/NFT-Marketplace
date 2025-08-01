import { Connection, PublicKey } from '@solana/web3.js';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

// Metaplex constants
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Interface for NFT metadata
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  external_url?: string;
  animation_url?: string;
  properties?: {
    files?: Array<{
      uri: string;
      type: string;
    }>;
    category?: string;
  };
}

// Interface for parsed metadata account
export interface ParsedMetadata {
  updateAuthority: PublicKey;
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  creators: Array<{
    address: PublicKey;
    verified: boolean;
    share: number;
  }> | null;
}

/**
 * Get the metadata PDA for an NFT mint
 */
export function getMetadataPDA(mintPublicKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      mintPublicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID
  );
}

/**
 * Fetch NFT metadata from the blockchain
 */
export async function fetchNFTMetadata(
  connection: Connection,
  mintPublicKey: PublicKey
): Promise<ParsedMetadata | null> {
  try {
    console.log(`🔍 [Metaplex] Fetching on-chain metadata for: ${mintPublicKey.toBase58()}`);
    const [metadataPDA] = getMetadataPDA(mintPublicKey);
    
    // Fetch the metadata account
    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    
    if (!metadataAccount) {
      console.warn(`❌ [Metaplex] No metadata account found for mint: ${mintPublicKey.toBase58()}`);
      return null;
    }

    console.log(`✅ [Metaplex] Metadata account found, size: ${metadataAccount.data.length} bytes`);

    // Parse the metadata account data
    try {
      // Try modern approach first
      let metadata;
      try {
        metadata = Metadata.deserialize(metadataAccount.data)[0];
      } catch (modernError) {
        // Fallback to alternative parsing
        console.log(`⚠️ [Metaplex] Modern deserialize failed, trying alternative approach...`);
        
        // Try alternative parsing method
        const data = metadataAccount.data;
        if (data.length < 100) {
          throw new Error('Metadata account too small');
        }
        
        // Basic manual parsing (simplified version)
        let offset = 1; // Skip version byte
        
        // Skip update authority (32 bytes)
        offset += 32;
        
        // Skip mint (32 bytes) 
        offset += 32;
        
        // Parse name length and name
        const nameLength = data.readUInt32LE(offset);
        offset += 4;
        
        if (nameLength > 200 || offset + nameLength > data.length) {
          throw new Error('Invalid name length');
        }
        
        const nameBytes = data.subarray(offset, offset + nameLength);
        const name = Buffer.from(nameBytes).toString('utf8').replace(/\0/g, '').trim();
        offset += nameLength;
        
        // Parse symbol length and symbol
        const symbolLength = data.readUInt32LE(offset);
        offset += 4;
        
        if (symbolLength > 20 || offset + symbolLength > data.length) {
          throw new Error('Invalid symbol length');
        }
        
        const symbolBytes = data.subarray(offset, offset + symbolLength);
        const symbol = Buffer.from(symbolBytes).toString('utf8').replace(/\0/g, '').trim();
        offset += symbolLength;
        
        // Parse URI length and URI
        const uriLength = data.readUInt32LE(offset);
        offset += 4;
        
        if (uriLength > 500 || offset + uriLength > data.length) {
          throw new Error('Invalid URI length');
        }
        
        const uriBytes = data.subarray(offset, offset + uriLength);
        const uri = Buffer.from(uriBytes).toString('utf8').replace(/\0/g, '').trim();
        
        metadata = {
          data: {
            name,
            symbol,
            uri,
            sellerFeeBasisPoints: 500, // Default 5%
            creators: null
          },
          mint: mintPublicKey,
          updateAuthority: mintPublicKey // Fallback
        };
      }
      
      console.log(`✅ [Metaplex] Successfully parsed metadata`);
      
      const result = {
        updateAuthority: metadata.updateAuthority,
        mint: metadata.mint,
        name: metadata.data.name,
        symbol: metadata.data.symbol,
        uri: metadata.data.uri,
        sellerFeeBasisPoints: metadata.data.sellerFeeBasisPoints || 500,
        creators: metadata.data.creators?.map(creator => ({
          address: creator.address,
          verified: creator.verified,
          share: creator.share,
        })) || null,
      };
      
      console.log(`📋 [Metaplex] Parsed - Name: "${result.name}", URI: "${result.uri}"`);
      return result;
    } catch (deserializeError) {
      console.error(`❌ [Metaplex] Deserialization error for ${mintPublicKey.toBase58()}:`, deserializeError);
      return null;
    }
  } catch (error) {
    console.error(`❌ [Metaplex] Error fetching metadata for mint ${mintPublicKey.toBase58()}:`, error);
    return null;
  }
}

/**
 * Fetch JSON metadata from URI (IPFS, Arweave, etc.)
 */
export async function fetchJSONMetadata(uri: string): Promise<NFTMetadata | null> {
  try {
    console.log(`🌐 [JSON] Fetching JSON metadata from: ${uri}`);
    
    // Handle IPFS URIs
    let fetchUrl = uri;
    if (uri.startsWith('ipfs://')) {
      // Use a public IPFS gateway
      fetchUrl = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
      console.log(`🔄 [JSON] Converted IPFS URI to: ${fetchUrl}`);
    }

    const response = await fetch(fetchUrl);
    console.log(`📡 [JSON] HTTP Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const metadata = await response.json();
    console.log(`✅ [JSON] Successfully parsed JSON metadata - Name: "${metadata.name}"`);
    console.log(`🖼️  [JSON] Image URL: "${metadata.image}"`);
    console.log(`📝 [JSON] Description: "${metadata.description}"`);
    console.log(`🏷️  [JSON] Attributes: ${metadata.attributes?.length || 0} traits`);
    
    // Validate that we have at least basic metadata
    if (!metadata.name) {
      console.warn('Invalid metadata: missing name field');
      return null;
    }

    // Handle IPFS image URIs
    let imageUrl = metadata.image || '';
    if (imageUrl.startsWith('ipfs://')) {
      imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    return {
      name: metadata.name || 'Unknown NFT',
      description: metadata.description || '',
      image: imageUrl,
      attributes: metadata.attributes || [],
      external_url: metadata.external_url,
      animation_url: metadata.animation_url?.startsWith('ipfs://') 
        ? metadata.animation_url.replace('ipfs://', 'https://ipfs.io/ipfs/')
        : metadata.animation_url,
      properties: metadata.properties,
    };
  } catch (error) {
    console.error(`Error fetching JSON metadata from ${uri}:`, error);
    return null;
  }
}

/**
 * Get complete NFT metadata (on-chain + JSON)
 */
export async function getCompleteNFTMetadata(
  connection: Connection,
  mintPublicKey: PublicKey
): Promise<{ onChain: ParsedMetadata; json: NFTMetadata } | null> {
  try {
    // First get on-chain metadata
    const onChainMetadata = await fetchNFTMetadata(connection, mintPublicKey);
    
    if (!onChainMetadata) {
      return null;
    }

    // Then fetch JSON metadata
    const jsonMetadata = await fetchJSONMetadata(onChainMetadata.uri);
    
    if (!jsonMetadata) {
      // Return default metadata if JSON fetch fails
      return {
        onChain: onChainMetadata,
        json: {
          name: onChainMetadata.name || 'Unknown NFT',
          description: 'NFT metadata could not be loaded',
          image: '', // No image available
          attributes: [],
        },
      };
    }

    return {
      onChain: onChainMetadata,
      json: jsonMetadata,
    };
  } catch (error) {
    console.error(`Error getting complete NFT metadata for ${mintPublicKey.toBase58()}:`, error);
    return null;
  }
}

/**
 * Batch fetch multiple NFT metadata
 */
export async function batchFetchNFTMetadata(
  connection: Connection,
  mints: PublicKey[]
): Promise<Map<string, { onChain: ParsedMetadata; json: NFTMetadata }>> {
  const results = new Map<string, { onChain: ParsedMetadata; json: NFTMetadata }>();
  
  // Process in batches to avoid overwhelming the RPC
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < mints.length; i += BATCH_SIZE) {
    const batch = mints.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (mint) => {
      const metadata = await getCompleteNFTMetadata(connection, mint);
      if (metadata) {
        results.set(mint.toBase58(), metadata);
      }
    });
    
    await Promise.all(promises);
    
    // Add small delay between batches to be respectful to the RPC
    if (i + BATCH_SIZE < mints.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Check if an NFT is likely a valid NFT (has metadata)
 */
export async function isValidNFT(
  connection: Connection,
  mintPublicKey: PublicKey
): Promise<boolean> {
  try {
    const [metadataPDA] = getMetadataPDA(mintPublicKey);
    const metadataAccount = await connection.getAccountInfo(metadataPDA);
    return metadataAccount !== null;
  } catch (error) {
    console.error(`Error checking if ${mintPublicKey.toBase58()} is valid NFT:`, error);
    return false;
  }
}