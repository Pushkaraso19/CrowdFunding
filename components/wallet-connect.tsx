"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/use-wallet"

export function WalletConnect() {
  const { address, chainId, connect, disconnect, reconnect, isLoading } = useWallet()

  const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-muted-foreground">{chainId ? `Chain ID: ${chainId}` : "Not connected"}</div>
      {address ? (
        <>
          <span
            aria-label="Connected wallet"
            className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
          >
            {short(address)}
          </span>
          <Button onClick={disconnect} disabled={isLoading} variant="secondary">
            Disconnect
          </Button>
        </>
      ) : (
        <>
          <Button onClick={connect} disabled={isLoading} variant="default">
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
          <Button onClick={reconnect} disabled={isLoading} variant="outline">
            Retry
          </Button>
        </>
      )}
    </div>
  )
}
