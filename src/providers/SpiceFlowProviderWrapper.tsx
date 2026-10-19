import type { ReactNode } from "react";
import { SpiceFlowProvider } from "@spicenet-io/spiceflow-ui";
import { useFundingWallet } from "../hooks/useFundingWallet";

export function SpiceFlowProviderWrapper({ children }: { children: ReactNode }) {
  const { isExternalAvailable } = useFundingWallet();
  // ondemand = scan external wallet; 7702 = embedded only
  const mode = isExternalAvailable ? "ondemand" : "7702";

  return (
    <SpiceFlowProvider
      appId={import.meta.env.VITE_SPICEFLOW_APP_ID}
      mode={mode}
      rpcUrls={{
        1: import.meta.env.VITE_RPC_URL_1,
        8453: import.meta.env.VITE_RPC_URL_8453,
        42161: import.meta.env.VITE_RPC_URL_42161,
      }}
    >
      {children}
    </SpiceFlowProvider>
  );
}
