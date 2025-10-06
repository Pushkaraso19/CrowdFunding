"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { getBrowserProvider, getEthereum } from "@/lib/ethers"

type WalletState = {
  address: string | null
  chainId: string | null
}

const CONNECTED_KEY = "wallet.connected"

const fetchWallet = async (): Promise<WalletState> => {
  const eth = getEthereum()
  if (!eth) return { address: null, chainId: null }
  const provider = await getBrowserProvider()
  // Get currently authorized accounts (no prompt)
  const accounts = await provider.send("eth_accounts", [])
  const network = await provider.getNetwork()
  return {
    address: accounts?.[0] ?? null,
    chainId: network?.chainId?.toString() ?? null,
  }
}

export function useWallet() {
  const { data, mutate, isLoading } = useSWR<WalletState>("wallet", fetchWallet, {
    revalidateOnFocus: false,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const listenersBound = useRef(false)

  // Connect (request permission)
  const connect = async () => {
    if (typeof window === "undefined") return
    const eth = getEthereum()
    if (!eth) {
      console.warn("MetaMask not detected")
      return
    }
    setIsConnecting(true)
    try {
      const provider = await getBrowserProvider()
      await provider.send("eth_requestAccounts", [])
      // Persist user intent to auto-reconnect on reload
      try {
        window.localStorage.setItem(CONNECTED_KEY, "true")
      } catch {}
      await mutate()
    } catch (err) {
      console.error("Wallet connect failed:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect (clear local state and persistence)
  const disconnect = async () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(CONNECTED_KEY)
      } catch {}
    }
    // Best-effort: update state to disconnected immediately
    await mutate({ address: null, chainId: data?.chainId ?? null }, false)
  }

  // Reconnect helper (calls connect if previously connected)
  const reconnect = async () => {
    if (typeof window === "undefined") return
    const wasConnected = (() => {
      try {
        return window.localStorage.getItem(CONNECTED_KEY) === "true"
      } catch {
        return false
      }
    })()
    if (wasConnected) {
      await connect()
    } else {
      // If permissions already exist, refresh state without prompting
      await mutate()
    }
  }

  // Bind EIP-1193 event listeners once
  useEffect(() => {
    const eth = getEthereum()
    if (!eth || listenersBound.current) return

    const handleAccountsChanged = async (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        try {
          window.localStorage.removeItem(CONNECTED_KEY)
        } catch {}
        await mutate({ address: null, chainId: null }, false)
        await mutate()
      } else {
        await mutate()
      }
    }

    const handleChainChanged = async (_chainId: string) => {
      // Refresh wallet state on chain changes
      await mutate()
    }

    eth.on?.("accountsChanged", handleAccountsChanged)
    eth.on?.("chainChanged", handleChainChanged)
    listenersBound.current = true

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged)
      eth.removeListener?.("chainChanged", handleChainChanged)
      listenersBound.current = false
    }
  }, [mutate])

  // Auto-reconnect on mount if user had connected previously
  useEffect(() => {
    if (typeof window === "undefined") return
    const wasConnected = (() => {
      try {
        return window.localStorage.getItem(CONNECTED_KEY) === "true"
      } catch {
        return false
      }
    })()
    if (wasConnected) {
      // Try silent refresh first (eth_accounts). If not authorized, user will click Connect.
      mutate()
    }
  }, [mutate])

  return {
    address: data?.address ?? null,
    chainId: data?.chainId ?? null,
    isLoading: isLoading || isConnecting,
    connecting: isConnecting,
    connect,
    reconnect,
    disconnect,
    refresh: () => mutate(),
  }
}
