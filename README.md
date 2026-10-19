# Spiceflow Cross-Chain Deposit — Integration Guide

Add a cross-chain deposit flow to a React + TypeScript app: users fund an in-app (embedded) wallet on Base from any external EVM wallet they already use.

## 1. How it works

```text
External wallet (MetaMask, Trust, Rabby, Base…)   ← funding SOURCE
        │  user approves the transfer
        ▼
Spiceflow routing (bridge / swap)
        ▼
Embedded wallet on Base                            ← DESTINATION
```

Rules to keep in mind:
- The external wallet is always the source. Never scan or charge the embedded wallet as the source.
- Email/social users have no external wallet: show only the embedded wallet.
- Never prompt the wallet (`eth_requestAccounts`, signatures) just to read balances.

## 2. Requirements
- React 18+, TypeScript
- Privy (auth + embedded wallet), Wagmi + viem
- Spiceflow SDK packages and an app ID from Spiceflow's dashboard
- A private RPC per chain (e.g. Alchemy) — public RPCs rate-limit and hide balances

## 3. Install
```bash
npm install @privy-io/react-auth @privy-io/wagmi wagmi viem @tanstack/react-query
npm install <spiceflow-sdk-packages>   # see Spiceflow docs for exact names
```

## 4. Environment
Copy `.env.example` to `.env` and fill it in. Never commit `.env`.

## 5. Provider setup
Wrap the app once, in this order: Privy → QueryClient → Wagmi → SpiceFlowProvider.

```tsx
<PrivyProvider appId={import.meta.env.VITE_PRIVY_APP_ID} config={{
  embeddedWallets: { createOnLogin: "users-without-wallets" }, // never recreate existing ones
}}>
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={wagmiConfig}>
      <SpiceFlowProvider
        mode={externalAddress ? "ondemand" : "7702"}
        rpcOverrides={RPCS}
      >
        <App />
      </SpiceFlowProvider>
    </WagmiProvider>
  </QueryClientProvider>
</PrivyProvider>
```

- `ondemand` = scans the external wallet + embedded wallet.
- `7702` = embedded wallet only. If you pick this by mistake, external assets disappear.

## 6. Supported tokens (only these are scanned, shown when balance > 0)
| Chain | Tokens |
|---|---|
| Ethereum | USDC, USDT, WBTC, ETH |
| BSC | USDC, USDT |
| Polygon | USDC, USDT |
| Base | USDC, USDT, ETH, cbETH |
| Arbitrum | USDC, USDT, WBTC, ETH, ARB |
| Robinhood | USDG, ETH |

Balances are read with Multicall3 `balanceOf`. Make sure every chain in `rpcOverrides` has a valid Multicall3 address.

## 7. Choosing the funding wallet
```ts
const external = wallets.find(w => w.walletClientType !== "privy");
const embedded = wallets.find(w => w.walletClientType === "privy");
```
Keep the chosen external wallet in a `useRef` so re-renders during a transaction don't swap it.

## 8. Wallet hydration (read this carefully)

After a page refresh, Privy restores wallets **asynchronously**. For a short moment `wallets` may contain only the embedded wallet, even though an external wallet is linked.

A common pattern is to **wait a short time (e.g. 3.5 seconds)** before deciding there is no external wallet:

```ts
const [graceOver, setGraceOver] = useState(false);
useEffect(() => { const t = setTimeout(() => setGraceOver(true), 3500); return () => clearTimeout(t); }, []);
const ready = !!external || graceOver;
```

**This is a fallback, not a guarantee.**
- The timer only says "we waited long enough to make a reasonable guess". It does **not** know whether restoration finished.
- On slow phones, weak networks, or in-app wallet browsers, restoration can take longer than 3.5 s. Then the app falls back to embedded-only and external assets are missing.
- Sometimes the external wallet never comes back in that session (e.g. the user revoked site access inside their wallet app). No timeout fixes that.

Make it robust:
1. **Keep listening after the timeout.** If the external wallet appears later, switch back to `ondemand` and rescan.
2. **Prefer real signals over time.** Use Privy's `ready` flag, and check `user.linkedAccounts` — if a wallet is linked but not in `wallets`, you know it's still restoring or disconnected.
3. **Silent check:** call `eth_accounts` (never `eth_requestAccounts`) on the injected provider to see if the wallet is still authorized.
4. **Give users a way out:** show a small "Don't see your assets? Reconnect wallet" link that reconnects or signs in again.
5. **Never call `wallet_revokePermissions` on logout** — some wallets (Rabby) honor it, and the next visit restores only the embedded wallet.

## 9. RPC proxy (recommended)
Proxy RPC calls through your server so keys stay private. Important: JSON-RPC errors often come back with HTTP 200 — inspect the body for `error` and try the next endpoint. Use an 8 s timeout per endpoint.

## 10. Deposit flow
1. User opens Deposit → external + embedded balances load.
2. User picks a token and amount → get a quote.
3. Refresh the quote right before sending.
4. User approves in their external wallet (this is the confirmation).
5. Show success with amount, network and transaction link; refresh balances.

## 11. Troubleshooting
| Symptom | Likely cause | Fix |
|---|---|---|
| Only embedded assets shown | Mode fell to `7702` before external wallet restored | Keep listening after the timeout; reconnect link |
| Some users only, any wallet app | Session restored without external wallet | Sign out / sign in; avoid revoking permissions on logout |
| Missing tokens | RPC rate limit or bad Multicall3 address | Private RPCs, fallback endpoints |
| Quote hangs | Public RPC throttling | `rpcOverrides` with private RPC |
| Wallet asks to connect again on every deposit | Calling `eth_requestAccounts` for reads | Use `eth_accounts` only |

## License
MIT — see `LICENSE`.
