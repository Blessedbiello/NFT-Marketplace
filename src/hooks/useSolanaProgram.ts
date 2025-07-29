import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, TransactionSignature } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import MarketplaceIDL from '../idl/anchor_nft_marketplace.json';

// Load configuration from environment variables
const PROGRAM_ID = new PublicKey(
  import.meta.env.VITE_PROGRAM_ID || 'FvdEiEPJUEMUZ7HCkK2gPfYGFXCbUB68mTJufdC9BjC5'
);

// Fix the IDL format by merging accounts with their type definitions
const fixIDLFormat = (idl: any): Idl => {
  const fixedIDL = JSON.parse(JSON.stringify(idl));
  
  // Find type definitions for accounts
  const typeDefinitions: Record<string, any> = {};
  if (fixedIDL.types && Array.isArray(fixedIDL.types)) {
    fixedIDL.types.forEach((type: any) => {
      if (type.name) {
        typeDefinitions[type.name] = type;
      }
    });
  }
  
  // Fix accounts section by adding type info and calculating sizes
  if (fixedIDL.accounts && Array.isArray(fixedIDL.accounts)) {
    fixedIDL.accounts = fixedIDL.accounts.map((account: any) => {
      // Find the corresponding type definition
      const typeDef = typeDefinitions[account.name];
      
      if (typeDef && typeDef.type) {
        // Add type information
        account.type = typeDef.type;
        
        // Calculate size based on fields
        let size = 8; // Discriminator
        if (typeDef.type.fields && Array.isArray(typeDef.type.fields)) {
          typeDef.type.fields.forEach((field: any) => {
            switch (field.type) {
              case 'pubkey': size += 32; break;
              case 'u64': case 'i64': size += 8; break;
              case 'u32': case 'i32': size += 4; break;
              case 'u16': case 'i16': size += 2; break;
              case 'u8': case 'i8': case 'bool': size += 1; break;
              default: size += 8; // Conservative estimate
            }
          });
        }
        account.size = size;
      } else {
        // Fallback for unknown accounts
        account.size = 1000;
      }
      
      return account;
    });
  }
  
  return fixedIDL as Idl;
};

// Use the original IDL first, then try fixed version if needed
let MARKETPLACE_IDL: Idl;
try {
  MARKETPLACE_IDL = MarketplaceIDL as Idl;
} catch (error) {
  console.log('IDL needs format fixing, applying compatibility fixes...');
  MARKETPLACE_IDL = fixIDLFormat(MarketplaceIDL);
}

// Default marketplace name for PDA derivation
const DEFAULT_MARKETPLACE_NAME = import.meta.env.VITE_MARKETPLACE_NAME || 'NFT-Nexus';

// Transaction configuration from environment
const DEFAULT_CONFIG = {
  commitment: (import.meta.env.VITE_COMMITMENT || 'confirmed') as 'processed' | 'confirmed' | 'finalized',
  preflightCommitment: (import.meta.env.VITE_PREFLIGHT_COMMITMENT || 'confirmed') as 'processed' | 'confirmed' | 'finalized',
  skipPreflight: import.meta.env.VITE_SKIP_PREFLIGHT === 'true',
  computeUnitLimit: parseInt(import.meta.env.VITE_DEFAULT_COMPUTE_UNIT_LIMIT || '200000'),
  computeUnitPrice: parseInt(import.meta.env.VITE_DEFAULT_COMPUTE_UNIT_PRICE || '1000'),
  transactionTimeout: parseInt(import.meta.env.VITE_TRANSACTION_TIMEOUT || '30000'),
  maxRetries: parseInt(import.meta.env.VITE_MAX_RETRIES || '3')
};

// Metaplex constants
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export interface MarketplaceAccount {
  authority: PublicKey;
  feeBps: number;
  marketplaceBump: number;
  treasury: PublicKey;
  treasuryBump: number;
  name: string;
  lastActionTimestamp: number;
  rateLimitInterval: number;
}

export interface ListingAccount {
  maker: PublicKey;
  nftMint: PublicKey;
  price: number;
  metadata: PublicKey;
  bump: number;
}

export function useSolanaProgram() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const provider = useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;
    
    return new AnchorProvider(
      connection,
      {
        publicKey,
        signTransaction,
        signAllTransactions,
      },
      { 
        commitment: DEFAULT_CONFIG.commitment,
        preflightCommitment: DEFAULT_CONFIG.preflightCommitment,
        skipPreflight: DEFAULT_CONFIG.skipPreflight
      }
    );
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  const program = useMemo(() => {
    if (!provider) return null;
    
    try {
      // Create the program with error handling
      console.log('Creating Anchor program with IDL...');
      
      // Try with original IDL first
      let prog;
      try {
        prog = new Program(MARKETPLACE_IDL, PROGRAM_ID, provider);
      } catch (idlError) {
        console.log('Original IDL failed, trying with fixed format...');
        const fixedIDL = fixIDLFormat(MarketplaceIDL);
        prog = new Program(fixedIDL, PROGRAM_ID, provider);
      }
      
      console.log('Anchor program created successfully');
      return prog;
    } catch (error) {
      console.error('Error creating Anchor program:', error);
      console.error('Provider:', provider);
      console.error('Program ID:', PROGRAM_ID.toBase58());
      
      // Log the specific error details
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      return null;
    }
  }, [provider]);

  // PDA derivation functions
  const getMarketplacePDA = (name: string = DEFAULT_MARKETPLACE_NAME): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('marketplace'), Buffer.from(name)],
      PROGRAM_ID
    );
  };

  const getTreasuryPDA = (marketplace: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('treasury'), marketplace.toBuffer()],
      PROGRAM_ID
    );
  };

  const getListingPDA = (marketplace: PublicKey, nftMint: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [marketplace.toBuffer(), nftMint.toBuffer()],
      PROGRAM_ID
    );
  };

  const getVaultPDA = async (listing: PublicKey, nftMint: PublicKey): Promise<PublicKey> => {
    return await getAssociatedTokenAddress(nftMint, listing, true);
  };

  const getMetadataPDA = (nftMint: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBuffer(), nftMint.toBuffer()],
      METADATA_PROGRAM_ID
    );
  };

  const getMasterEditionPDA = (nftMint: PublicKey): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), METADATA_PROGRAM_ID.toBuffer(), nftMint.toBuffer(), Buffer.from('edition')],
      METADATA_PROGRAM_ID
    );
  };

  // Program instruction wrappers
  const initializeMarketplace = async (
    name: string = DEFAULT_MARKETPLACE_NAME,
    fee: number = 250 // 2.5% in basis points
  ): Promise<TransactionSignature | null> => {
    if (!program || !publicKey) return null;

    try {
      const [marketplacePDA] = getMarketplacePDA(name);
      const [treasuryPDA] = getTreasuryPDA(marketplacePDA);

      const tx = await program.methods
        .initializeMarketplace(name, fee)
        .accounts({
          admin: publicKey,
          marketplace: marketplacePDA,
          treasury: treasuryPDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error initializing marketplace:', error);
      throw error;
    }
  };

  const listNft = async (
    nftMint: PublicKey,
    price: number // in lamports
  ): Promise<TransactionSignature | null> => {
    if (!program || !publicKey) return null;

    try {
      const [marketplacePDA] = getMarketplacePDA();
      const [listingPDA] = getListingPDA(marketplacePDA, nftMint);
      const [metadataPDA] = getMetadataPDA(nftMint);
      const [masterEditionPDA] = getMasterEditionPDA(nftMint);
      
      const makerNftAta = await getAssociatedTokenAddress(nftMint, publicKey);
      const vaultPDA = await getAssociatedTokenAddress(nftMint, listingPDA, true);

      const tx = await program.methods
        .listNft(new BN(price))
        .accounts({
          maker: publicKey,
          marketplace: marketplacePDA,
          makerNftMint: nftMint,
          makerNftAta: makerNftAta,
          vault: vaultPDA,
          listing: listingPDA,
          metadata: metadataPDA,
          masterEdition: masterEditionPDA,
          metadataProgram: METADATA_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    }
  };

  const purchaseNft = async (
    nftMint: PublicKey,
    seller: PublicKey
  ): Promise<TransactionSignature | null> => {
    if (!program || !publicKey) return null;

    try {
      const [marketplacePDA] = getMarketplacePDA();
      const [listingPDA] = getListingPDA(marketplacePDA, nftMint);
      const [treasuryPDA] = getTreasuryPDA(marketplacePDA);
      const [metadataPDA] = getMetadataPDA(nftMint);
      
      const takerAta = await getAssociatedTokenAddress(nftMint, publicKey);
      const vaultPDA = await getAssociatedTokenAddress(nftMint, listingPDA, true);

      const tx = await program.methods
        .purchaseNft()
        .accounts({
          taker: publicKey,
          maker: seller,
          makerNftMint: nftMint,
          marketplace: marketplacePDA,
          takerAta: takerAta,
          vault: vaultPDA,
          listing: listingPDA,
          metadata: metadataPDA,
          treasury: treasuryPDA,
          metadataProgram: METADATA_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      throw error;
    }
  };

  const delistNft = async (
    nftMint: PublicKey
  ): Promise<TransactionSignature | null> => {
    if (!program || !publicKey) return null;

    try {
      const [marketplacePDA] = getMarketplacePDA();
      const [listingPDA] = getListingPDA(marketplacePDA, nftMint);
      const [metadataPDA] = getMetadataPDA(nftMint);
      const [masterEditionPDA] = getMasterEditionPDA(nftMint);
      
      const makerNftAta = await getAssociatedTokenAddress(nftMint, publicKey);
      const vaultPDA = await getAssociatedTokenAddress(nftMint, listingPDA, true);

      const tx = await program.methods
        .delistNft()
        .accounts({
          maker: publicKey,
          marketplace: marketplacePDA,
          makerNftMint: nftMint,
          makerNftAta: makerNftAta,
          vault: vaultPDA,
          listing: listingPDA,
          metadata: metadataPDA,
          masterEdition: masterEditionPDA,
          metadataProgram: METADATA_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error delisting NFT:', error);
      throw error;
    }
  };

  const updateMarketplaceFee = async (
    newFee: number
  ): Promise<TransactionSignature | null> => {
    if (!program || !publicKey) return null;

    try {
      const [marketplacePDA] = getMarketplacePDA();

      const tx = await program.methods
        .updateFee(newFee)
        .accounts({
          admin: publicKey,
          marketplace: marketplacePDA,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error updating marketplace fee:', error);
      throw error;
    }
  };

  const updateAuthority = async (
    newAuthority: PublicKey
  ): Promise<TransactionSignature | null> => {
    if (!program || !publicKey) return null;

    try {
      const [marketplacePDA] = getMarketplacePDA();

      const tx = await program.methods
        .updateAuthority()
        .accounts({
          currentAuthority: publicKey,
          marketplace: marketplacePDA,
          newAuthority: newAuthority,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error updating authority:', error);
      throw error;
    }
  };

  const updateRateLimit = async (
    rateLimitInterval: number
  ): Promise<TransactionSignature | null> => {
    if (!program || !publicKey) return null;

    try {
      const [marketplacePDA] = getMarketplacePDA();

      const tx = await program.methods
        .updateRateLimit(new BN(rateLimitInterval))
        .accounts({
          authority: publicKey,
          marketplace: marketplacePDA,
        })
        .rpc();

      return tx;
    } catch (error) {
      console.error('Error updating rate limit:', error);
      throw error;
    }
  };

  // Fetch account data
  const fetchMarketplace = async (name: string = DEFAULT_MARKETPLACE_NAME): Promise<MarketplaceAccount | null> => {
    if (!program) return null;

    try {
      const [marketplacePDA] = getMarketplacePDA(name);
      const marketplaceAccount = await program.account.marketplace.fetch(marketplacePDA);
      return marketplaceAccount as MarketplaceAccount;
    } catch (error) {
      console.error('Error fetching marketplace:', error);
      return null;
    }
  };

  const fetchListing = async (nftMint: PublicKey): Promise<ListingAccount | null> => {
    if (!program) return null;

    try {
      const [marketplacePDA] = getMarketplacePDA();
      const [listingPDA] = getListingPDA(marketplacePDA, nftMint);
      const listingAccount = await program.account.listing.fetch(listingPDA);
      return listingAccount as ListingAccount;
    } catch (error) {
      console.error('Error fetching listing:', error);
      return null;
    }
  };

  const fetchAllListings = async (): Promise<(ListingAccount & { publicKey: PublicKey })[]> => {
    if (!program) return [];

    try {
      const listings = await program.account.listing.all();
      return listings.map(listing => ({
        ...listing.account as ListingAccount,
        publicKey: listing.publicKey
      }));
    } catch (error) {
      console.error('Error fetching all listings:', error);
      return [];
    }
  };

  // Utility functions
  const lamportsToSol = (lamports: number): number => {
    return lamports / LAMPORTS_PER_SOL;
  };

  const solToLamports = (sol: number): number => {
    return Math.floor(sol * LAMPORTS_PER_SOL);
  };

  return {
    // Core program objects
    program,
    provider,
    programId: PROGRAM_ID,
    
    // PDA derivation
    getMarketplacePDA,
    getTreasuryPDA,
    getListingPDA,
    getVaultPDA,
    getMetadataPDA,
    getMasterEditionPDA,
    
    // Program instructions
    initializeMarketplace,
    listNft,
    purchaseNft,
    delistNft,
    updateMarketplaceFee,
    updateAuthority,
    updateRateLimit,
    
    // Account fetching
    fetchMarketplace,
    fetchListing,
    fetchAllListings,
    
    // Utilities
    lamportsToSol,
    solToLamports,
  };
}