import { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

/**
 * Source = external wallet. Destination = embedded wallet.
 * The 3.5s wait is a FALLBACK, not a guarantee: we keep listening afterwards,
 * so a late external wallet still switches the app back to scanning it.
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
    /** Linked but not restored — show "Reconnecting wallet…" + reconnect button. */
    needsReconnect: !waiting && !external && Boolean(linkedExternal),
  };
}
