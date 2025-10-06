"use client"

import useSWR from "swr"
import { getReadContract, getWriteContract } from "@/lib/ethers"
import { toEth } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useWallet } from "@/hooks/use-wallet"

type Campaign = {
  id: bigint
  title: string
  description: string
  creator: string
  goal: bigint
  deadline: bigint
  totalRaised: bigint
  withdrawn: boolean
  contributorCount: bigint
}

const fetchCampaign = async (id: string): Promise<Campaign> => {
  const contract = getReadContract()
  const c = await contract.getCampaign(id)
  return c as Campaign
}

const fetchContributors = async (id: string) => {
  const contract = getReadContract()
  const c = (await contract.getCampaign(id)) as Campaign
  const count = Number(c.contributorCount)
  const rows: { address: string; amount: bigint }[] = []
  for (let i = 0; i < count; i++) {
    const [addr, amount] = await contract.getContributorAt(id, i)
    rows.push({ address: addr, amount })
  }
  return rows
}

export function CampaignDetail({ id }: { id: string }) {
  const { address } = useWallet()
  const { data: c, mutate } = useSWR(["campaign", id], ([, cid]) => fetchCampaign(cid), { refreshInterval: 4000 })
  const { data: contributors } = useSWR(["contributors", id], ([, cid]) => fetchContributors(cid), {
    refreshInterval: 8000,
  })
  const [withdrawing, setWithdrawing] = useState(false)
  const [refunding, setRefunding] = useState(false)

  if (!c) return <div className="text-muted-foreground">Loading...</div>

  const isOwner = address?.toLowerCase() === c.creator.toLowerCase()
  const goalReached = toEth(c.totalRaised) >= toEth(c.goal)
  const ended = Number(c.deadline) * 1000 < Date.now()

  const withdraw = async () => {
    try {
      setWithdrawing(true)
      const contract = await getWriteContract()
      const tx = await contract.withdrawFunds(c.id)
      await tx.wait()
      await mutate()
    } catch (e: any) {
      alert(e?.shortMessage || e?.message || "Withdraw failed")
    } finally {
      setWithdrawing(false)
    }
  }

  const refund = async () => {
    try {
      setRefunding(true)
      const contract = await getWriteContract()
      const tx = await contract.refundContributors(c.id)
      await tx.wait()
      await mutate()
    } catch (e: any) {
      alert(e?.shortMessage || e?.message || "Refund failed")
    } finally {
      setRefunding(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-pretty">{c.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{c.description}</p>
          <div className="text-sm text-muted-foreground">
            Creator: <span className="font-mono">{c.creator}</span>
          </div>
          <div className="text-sm">
            Goal: {toEth(c.goal)} ETH • Raised: {toEth(c.totalRaised)} ETH
          </div>
          <div className="text-sm text-muted-foreground">
            Deadline: {new Date(Number(c.deadline) * 1000).toLocaleString()}
          </div>
          <div aria-label="Progress" className="w-full h-2 rounded bg-secondary">
            <div
              className="h-2 rounded bg-primary"
              style={{
                width: `${Math.min(100, Math.floor((toEth(c.totalRaised) / Math.max(1e-18, toEth(c.goal))) * 100))}%`,
              }}
            />
          </div>
          <div className="flex gap-2">
            {isOwner && goalReached && !c.withdrawn && (
              <Button onClick={withdraw} disabled={withdrawing}>
                {withdrawing ? "Withdrawing..." : "Withdraw Funds"}
              </Button>
            )}
            {!goalReached && ended && (
              <Button onClick={refund} variant="secondary" disabled={refunding}>
                {refunding ? "Refunding..." : "Claim Refund"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Contributors</h3>
        <div className="rounded-lg border divide-y">
          {contributors?.length ? (
            contributors.map((row) => (
              <div key={row.address} className="flex items-center justify-between p-3">
                <span className="font-mono text-sm">{row.address}</span>
                <span className="text-sm">{toEth(row.amount)} ETH</span>
              </div>
            ))
          ) : (
            <div className="p-3 text-muted-foreground text-sm">No contributors yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
