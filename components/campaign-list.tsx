"use client"

import useSWR from "swr"
import { getReadContract } from "@/lib/ethers"
import { CampaignCard } from "./campaign-card"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"
import { toEth } from "@/lib/format"

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

const fetchCampaigns = async (): Promise<Campaign[]> => {
  const contract = getReadContract()
  const list = await contract.getCampaigns()
  return list as Campaign[]
}

type Filter = "recent" | "most-funded" | "nearly-complete"

export function CampaignList() {
  const { data, isLoading, mutate } = useSWR("campaigns", fetchCampaigns, { refreshInterval: 5000 })
  const [filter, setFilter] = useState<Filter>("recent")

  const filtered = useMemo(() => {
    if (!data) return []
    const arr = [...data]
    if (filter === "recent") {
      // Highest id first
      arr.sort((a, b) => Number(b.id) - Number(a.id))
    } else if (filter === "most-funded") {
      arr.sort((a, b) => toEth(b.totalRaised) - toEth(a.totalRaised))
    } else if (filter === "nearly-complete") {
      arr.sort((a, b) => {
        const pa = toEth(a.totalRaised) / Math.max(1e-18, toEth(a.goal))
        const pb = toEth(b.totalRaised) / Math.max(1e-18, toEth(b.goal))
        return pb - pa
      })
    }
    return arr
  }, [data, filter])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant={filter === "recent" ? "default" : "secondary"} onClick={() => setFilter("recent")}>
          Recent
        </Button>
        <Button variant={filter === "most-funded" ? "default" : "secondary"} onClick={() => setFilter("most-funded")}>
          Most funded
        </Button>
        <Button
          variant={filter === "nearly-complete" ? "default" : "secondary"}
          onClick={() => setFilter("nearly-complete")}
        >
          Nearly complete
        </Button>
        <Button variant="outline" onClick={() => mutate()}>
          Refresh
        </Button>
      </div>
      {isLoading && <div className="text-muted-foreground">Loading campaigns...</div>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CampaignCard key={String(c.id)} c={c} />
        ))}
      </div>
      {!isLoading && filtered.length === 0 && (
        <div className="text-muted-foreground">No campaigns yet. Be the first to create one!</div>
      )}
    </div>
  )
}
