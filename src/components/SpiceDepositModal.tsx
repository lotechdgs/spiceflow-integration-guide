import { SpiceSupply } from "@spicenet-io/spiceflow-ui";
import { usePrivy } from "@privy-io/react-auth";
import { SPICEFLOW_CONFIG } from "../config/spiceflow";
import { useFundingWallet } from "../hooks/useFundingWallet";

export function SpiceDepositModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { connectWallet } = usePrivy();
  const { externalAddress, embeddedAddress, isHydrating, needsReconnect } = useFundingWallet();
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header>
          <h2>Deposit</h2>
          <button onClick={onClose} aria-label="Close">✕</button>
        </header>

        {isHydrating ? (
          <p>Detecting your wallet…</p>
        ) : (
          <>
            {needsReconnect && (
              <button onClick={() => connectWallet()}>Don't see your wallet? Reconnect</button>
            )}
            <SpiceSupply
              destinationToken={SPICEFLOW_CONFIG.destinationToken}
              recipientAddress={embeddedAddress ?? undefined}
              includeExternalWalletAssets={Boolean(externalAddress)}
              onSuccess={onClose}
            />
          </>
        )}
      </div>
    </div>
  );
}
