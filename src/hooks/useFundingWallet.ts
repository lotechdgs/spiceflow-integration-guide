import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

/**
 * Resolves the external funding wallet (source) and embedded wallet (destination).
 *
 * The 3.5-second timeout is a FALLBACK heuristic, not a guarantee:
 * we continue listening afterwards so a late-hydrating external wallet
 * still triggers a mode switch back to scanning external assets.
 */
export function useFundingWallet() {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [waiting, setWaiting] = useState(true);

  const embedded = wallets.find((w) => w.walletClientType === "privy");
  const external = wallets.find((w) => w.walletClientType !== "privy");

  const linkedExternal = user?.linkedAccounts?.some(
    (a: any) => a.type === "wallet" && a.walletClientType !== "privy",
  );

  useEffect(() => {
    if (!authenticated || external) {
      setWaiting(false);
      return;
    }
    setWaiting(true);
    const t = setTimeout(() => setWaiting(false), 3500);
    return () => clearTimeout(t);
  }, [authenticated, external]);

  return {
    externalAddress: (external?.address ?? null) as `0x${string}` | null,
    embeddedAddress: (embedded?.address ?? null) as `0x${string}` | null,
    isHydrating: waiting,
    isExternalAvailable: Boolean(external),
    /** Linked external wallet exists in user profile but hasn't hydrated into active session. */
    needsReconnect: !waiting && !external && Boolean(linkedExternal),
  };
}
