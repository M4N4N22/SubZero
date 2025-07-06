// lib/massaWallet.ts
export async function connectToMassaWallet() {
    const { getWallets } = await import("@massalabs/wallet-provider");
  
    const wallets = await getWallets();
    if (wallets.length === 0) {
      throw new Error("No wallets detected");
    }
  
    const wallet = wallets[0];
    const accounts = await wallet.accounts();
    if (accounts.length > 0) {
      return accounts[0];
    }
  
    throw new Error("No accounts found");
  }
  