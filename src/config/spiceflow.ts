/**
 * Spiceflow Target EVM Chain Configuration
 *
 * This guide works for ANY EVM chain supported by Spiceflow.
 * Change DESTINATION_CHAIN_ID and destinationToken to match your app's deployment:
 *   - Base: 8453
 *   - Arbitrum One: 42161
 *   - Optimism: 10
 *   - Polygon: 137
 *   - Ethereum: 1
 *   - BSC: 56
 */

// Specimen deployment: Base mainnet (replace with your target EVM chain ID)
export const DESTINATION_CHAIN_ID = 8453;

export const SPICEFLOW_CONFIG = {
  network: "mainnet" as const,
  nativeChainId: DESTINATION_CHAIN_ID,
  destinationToken: {
    chainId: DESTINATION_CHAIN_ID,
    // Contract address of the receiving token on your destination EVM chain
    address: "0xYourTokenAddressOnTargetChain" as `0x${string}`,
    symbol: "TOKEN",
    decimals: 18,
  },
};

/**
 * Filtered tokens scanned per source chain (shown when balance > 0).
 * Curating allowed symbols prevents querying thousands of spam tokens
 * and keeps initial multi-chain balance scans fast.
 */
export const ALLOWED_SYMBOLS_BY_CHAIN: Record<number, string[]> = {
  1: ["USDC", "USDT", "WBTC", "ETH"], // Ethereum
  10: ["USDC", "USDT", "ETH", "OP"], // Optimism
  56: ["USDC", "USDT"], // BNB Chain
  137: ["USDC", "USDT"], // Polygon
  8453: ["USDC", "USDT", "ETH", "cbETH"], // Base
  42161: ["USDC", "USDT", "WBTC", "ETH", "ARB"], // Arbitrum
};
