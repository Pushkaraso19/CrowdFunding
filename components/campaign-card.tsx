"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { getWriteContract } from "@/lib/ethers"
import { toEth, toWei } from "@/lib/format"

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

export function CampaignCard({ c }: { c: Campaign }) {
  const [amount, setAmount] = useState("")
  const [sending, setSending] = useState(false)

  const progressPct = Math.min(100, Math.floor((toEth(c.totalRaised) / Math.max(1e-18, toEth(c.goal))) * 100))

  const ended = Number(c.deadline) * 1000 < Date.now()
  const status = c.withdrawn
    ? "Withdrawn"
    : toEth(c.totalRaised) >= toEth(c.goal)
      ? "Goal Reached"
      : ended
        ? "Ended"
        : "Active"

  const contribute = async () => {
    try {
      setSending(true)
      const contract = await getWriteContract()
      const tx = await contract.contribute(c.id, { value: toWei(amount) })
      await tx.wait()
      setAmount("")
      // simple feedback
      alert("Contribution sent!")
    } catch (err: any) {
      console.error("[v0] contribute error:", err?.message || err)
      alert(err?.shortMessage || err?.message || "Contribution failed")
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="space-y-1">
        <CardTitle className="text-pretty">{c.title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Goal: {toEth(c.goal)} ETH • Raised: {toEth(c.totalRaised)} ETH • {String(c.contributorCount)} backers
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{c.description}</p>
        <div aria-label="Progress" className="w-full h-2 rounded bg-secondary">
          <div
            className="h-2 rounded bg-primary"
            style={{ width: `${progressPct}%` }}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
            role="progressbar"
          />
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Amount (ETH)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.0001"
            min="0"
          />
          <Button onClick={contribute} disabled={sending || !amount}>
            {sending ? "Sending..." : "Contribute"}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Deadline: {new Date(Number(c.deadline) * 1000).toLocaleString()}
          </span>
          <span className="px-2 py-1 rounded bg-accent text-accent-foreground text-xs">{status}</span>
        </div>
        <div className="pt-2">
          <Link className="text-primary underline" href={`/campaigns/${String(c.id)}`}>
            View details
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
