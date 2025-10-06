"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useState } from "react"
import { getWriteContract } from "@/lib/ethers"
import { toEth, toWei } from "@/lib/format"
import { Clock, Users, Target, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react"

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
  const deadline = Number(c.deadline) * 1000
  const now = Date.now()
  const ended = deadline < now
  const goalReached = toEth(c.totalRaised) >= toEth(c.goal)

  // Calculate time remaining
  const timeRemaining = deadline - now
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))
  const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60))

  const getTimeRemainingText = () => {
    if (ended) return "Campaign ended"
    if (daysRemaining > 1) return `${daysRemaining} days left`
    if (hoursRemaining > 1) return `${hoursRemaining} hours left`
    if (timeRemaining > 0) return "Less than 1 hour left"
    return "Campaign ended"
  }

  // Status with more detailed information
  const getStatus = () => {
    if (c.withdrawn) return { text: "Withdrawn", variant: "secondary", icon: XCircle }
    if (goalReached) return { text: "Goal Reached", variant: "default", icon: CheckCircle }
    if (ended) return { text: "Ended", variant: "destructive", icon: AlertCircle }
    return { text: "Active", variant: "default", icon: TrendingUp }
  }

  const status = getStatus()

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
    <Card className="bg-card text-card-foreground hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-pretty line-clamp-2 flex-1">{c.title}</CardTitle>
          <Badge variant={status.variant as any} className="ml-2 flex items-center gap-1 text-xs">
            <status.icon className="h-3 w-3" />
            {status.text}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{toEth(c.goal)} ETH</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{toEth(c.totalRaised)} ETH</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{String(c.contributorCount)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{c.description}</p>
        
        {/* Progress Bar with Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPct}%</span>
          </div>
          <div aria-label="Progress" className="w-full h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPct}
              role="progressbar"
            />
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className={`${ended ? 'text-muted-foreground' : daysRemaining <= 3 ? 'text-orange-600' : 'text-muted-foreground'}`}>
            {getTimeRemainingText()}
          </span>
        </div>

        {/* Contribution Form - Only show for active campaigns */}
        {!c.withdrawn && !ended && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              step="0.0001"
              min="0"
              className="text-sm"
            />
            <Button 
              onClick={contribute} 
              disabled={sending || !amount || goalReached}
              size="sm"
              className="whitespace-nowrap"
            >
              {sending ? "Sending..." : "Contribute"}
            </Button>
          </div>
        )}

        {/* Campaign Details Link */}
        <div className="pt-2 border-t">
          <Link 
            className="text-primary hover:text-primary/80 underline text-sm font-medium inline-flex items-center gap-1" 
            href={`/campaigns/${String(c.id)}`}
          >
            View details →
          </Link>
        </div>

        {/* Creator Info */}
        <div className="text-xs text-muted-foreground">
          <span>Created by </span>
          <code className="px-1 py-0.5 bg-muted rounded text-xs">
            {c.creator.slice(0, 6)}...{c.creator.slice(-4)}
          </code>
        </div>
      </CardContent>
    </Card>
  )
}
