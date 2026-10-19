export const DESTINATION_CHAIN_ID = 8453; // Base

export const SPICEFLOW_CONFIG = {
  network: "mainnet" as const,
  nativeChainId: DESTINATION_CHAIN_ID,
  destinationToken: {
    chainId: DESTINATION_CHAIN_ID,
    address: "0xYourTokenAddressOnBase" as `0x${string}`,
    symbol: "TOKEN",
    decimals: 18,
  },
};

/** Only these assets are scanned per chain (shown when balance > 0). */
export const ALLOWED_SYMBOLS_BY_CHAIN: Record<number, string[]> = {
  1: ["USDC", "USDT", "WBTC", "ETH"],
  56: ["USDC", "USDT"],
  137: ["USDC", "USDT"],
  8453: ["USDC", "USDT", "ETH", "cbETH"],
  42161: ["USDC", "USDT", "WBTC", "ETH", "ARB"],
};
