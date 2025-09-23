import { ethers } from 'ethers';

export class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  async connectWallet(): Promise<{ address: string; signer: ethers.Signer }> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();

      return { address, signer: this.signer };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Wallet not connected');
    }

    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async switchToBlockDAGNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // BlockDAG Primordial Testnet configuration (VERIFIED)
    const blockDAGTestnet = {
      chainId: '0x413', // 1043 in hex (verified chain ID)
      chainName: 'BlockDAG Primordial Testnet',
      nativeCurrency: {
        name: 'BDAG',
        symbol: 'BDAG', 
        decimals: 18,
      },
      rpcUrls: ['https://rpc.primordial.bdagscan.com'], // Verified RPC URL without trailing slash
      blockExplorerUrls: ['https://primordial.bdagscan.com'],
    };

    // Always use BlockDAG testnet for this application
    // You can change this to localNetwork for local development if needed
    const targetNetwork = blockDAGTestnet;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetNetwork.chainId }],
      });
      console.log('Successfully switched to BlockDAG network');
    } catch (switchError: unknown) {
      console.log('Switch error:', switchError);
      
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
        console.log('Network not found, attempting to add...', targetNetwork);
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [targetNetwork],
          });
          console.log('Successfully added BlockDAG network');
        } catch (addError) {
          console.error('Failed to add BlockDAG network:', addError);
          console.error('Network config used:', JSON.stringify(targetNetwork, null, 2));
          throw addError;
        }
      } else {
        console.error('Failed to switch to BlockDAG network:', switchError);
        throw switchError;
      }
    }
  }

  getSigner(): ethers.Signer | null {
    return this.signer;
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider;
  }

  isConnected(): boolean {
    return this.signer !== null;
  }
}

// Global wallet service instance
export const walletService = new WalletService();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}