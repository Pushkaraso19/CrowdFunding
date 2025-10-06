import { formatEther, parseEther } from "ethers"

export const toEth = (wei: bigint | number | string) => {
  try {
    return Number(formatEther(wei as any))
  } catch {
    return 0
  }
}

export const toWei = (eth: string) => {
  return parseEther(eth || "0")
}

export const nowSeconds = () => Math.floor(Date.now() / 1000)
