import { BrowserProvider, Contract, JsonRpcProvider } from "ethers"
import { CROWDFUNDING_ABI } from "@/lib/abi/crowdfunding"
import { CONTRACT_ADDRESS } from "@/config/contract"

export type Ethereumish = {
  request: (args: { method: string; params?: any[] }) => Promise<any>
  on?: (event: string, cb: (...args: any[]) => void) => void
  removeListener?: (event: string, cb: (...args: any[]) => void) => void
}

export const getEthereum = (): Ethereumish | null => {
  if (typeof window === "undefined") return null
  return (window as any).ethereum ?? null
}

export const getBrowserProvider = async (): Promise<BrowserProvider> => {
  const eth = getEthereum()
  if (!eth) throw new Error("MetaMask not detected")
  return new BrowserProvider(eth as any)
}

// Optional: for read-only access when not connected (Ganache RPC)
// Update the URL if your Ganache RPC differs
export const getJsonRpcProvider = () => {
  if (typeof window === "undefined") return new JsonRpcProvider("http://127.0.0.1:8545")
  return new JsonRpcProvider("http://127.0.0.1:8545")
}

export const getReadContract = (): Contract => {
  // use JSON-RPC read provider to allow reads before wallet connect
  const provider = getJsonRpcProvider()
  return new Contract(CONTRACT_ADDRESS, CROWDFUNDING_ABI, provider)
}

export const getWriteContract = async (): Promise<Contract> => {
  const provider = await getBrowserProvider()
  const signer = await provider.getSigner()
  return new Contract(CONTRACT_ADDRESS, CROWDFUNDING_ABI, signer)
}
