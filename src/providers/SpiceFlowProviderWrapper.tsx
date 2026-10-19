import type { ReactNode } from "react";
import { SpiceFlowProvider } from "@spicenet-io/spiceflow-ui";
import { useFundingWallet } from "../hooks/useFundingWallet";

export function SpiceFlowProviderWrapper({ children }: { children: ReactNode }) {
  const { isExternalAvailable } = useFundingWallet();

  // 'ondemand' = scans external wallet assets across EVM chains
  // '7702' = scans embedded wallet only
  const mode = isExternalAvailable ? "ondemand" : "7702";

  // Provide your own reliable RPC endpoints for any source or destination EVM chains
  return (
    <SpiceFlowProvider
      appId={import.meta.env.VITE_SPICEFLOW_APP_ID}
      mode={mode}
      rpcUrls={{
        1: import.meta.env.VITE_RPC_URL_1,
        10: import.meta.env.VITE_RPC_URL_10,
        56: import.meta.env.VITE_RPC_URL_56,
        137: import.meta.env.VITE_RPC_URL_137,
        8453: import.meta.env.VITE_RPC_URL_8453,
        42161: import.meta.env.VITE_RPC_URL_42161,
      }}
    >
      {children}
    </SpiceFlowProvider>
  );
}
