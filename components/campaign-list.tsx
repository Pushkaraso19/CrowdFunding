"use client"

import useSWR from "swr"
import { getReadContract } from "@/lib/ethers"
import { CampaignCard } from "./campaign-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useMemo, useEffect } from "react"
import { toEth } from "@/lib/format"
import { Search, RefreshCcw, TrendingUp, Clock, Users, Target } from "lucide-react"

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

type SortBy = "recent" | "most-funded" | "nearly-complete" | "ending-soon" | "goal-amount" | "contributor-count"
type StatusFilter = "all" | "active" | "ended" | "goal-reached" | "withdrawn"

export function CampaignList() {
  const { data, isLoading, mutate } = useSWR("campaigns", fetchCampaigns, { refreshInterval: 5000 })
  const [sortBy, setSortBy] = useState<SortBy>("recent")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filtered = useMemo(() => {
    if (!data) return []
    let arr = [...data]

    // Filter by search query
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase()
      arr = arr.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      arr = arr.filter((campaign) => {
        const now = Date.now()
        const deadline = Number(campaign.deadline) * 1000
        const goalReached = toEth(campaign.totalRaised) >= toEth(campaign.goal)
        
        switch (statusFilter) {
          case "active":
            return !campaign.withdrawn && !goalReached && deadline > now
          case "ended":
            return !campaign.withdrawn && !goalReached && deadline <= now
          case "goal-reached":
            return !campaign.withdrawn && goalReached
          case "withdrawn":
            return campaign.withdrawn
          default:
            return true
        }
      })
    }

    // Sort campaigns
    if (sortBy === "recent") {
      arr.sort((a, b) => Number(b.id) - Number(a.id))
    } else if (sortBy === "most-funded") {
      arr.sort((a, b) => toEth(b.totalRaised) - toEth(a.totalRaised))
    } else if (sortBy === "nearly-complete") {
      arr.sort((a, b) => {
        const pa = toEth(a.totalRaised) / Math.max(1e-18, toEth(a.goal))
        const pb = toEth(b.totalRaised) / Math.max(1e-18, toEth(b.goal))
        return pb - pa
      })
    } else if (sortBy === "ending-soon") {
      arr.sort((a, b) => Number(a.deadline) - Number(b.deadline))
    } else if (sortBy === "goal-amount") {
      arr.sort((a, b) => toEth(b.goal) - toEth(a.goal))
    } else if (sortBy === "contributor-count") {
      arr.sort((a, b) => Number(b.contributorCount) - Number(a.contributorCount))
    }

    return arr
  }, [data, sortBy, statusFilter, debouncedSearch])

  // Calculate stats
  const stats = useMemo(() => {
    if (!data) return { total: 0, totalRaised: 0, avgFunding: 0, active: 0 }
    
    const total = data.length
    const totalRaised = data.reduce((sum, c) => sum + toEth(c.totalRaised), 0)
    const avgFunding = total > 0 
      ? data.reduce((sum, c) => {
          const percent = toEth(c.totalRaised) / Math.max(1e-18, toEth(c.goal))
          return sum + percent
        }, 0) / total * 100
      : 0
    
    const active = data.filter(c => {
      const now = Date.now()
      const deadline = Number(c.deadline) * 1000
      const goalReached = toEth(c.totalRaised) >= toEth(c.goal)
      return !c.withdrawn && !goalReached && deadline > now
    }).length

    return { total, totalRaised, avgFunding, active }
  }, [data])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRaised.toFixed(2)} ETH</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Funding</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgFunding.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4">
          {/* Status Filters */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Status</div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "ended", label: "Ended" },
                { key: "goal-reached", label: "Goal Reached" },
                { key: "withdrawn", label: "Withdrawn" }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={statusFilter === key ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setStatusFilter(key as StatusFilter)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Sort by</div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "recent", label: "Recent", icon: Clock },
                { key: "most-funded", label: "Most Funded", icon: TrendingUp },
                { key: "nearly-complete", label: "Nearly Complete", icon: Target },
                { key: "ending-soon", label: "Ending Soon", icon: Clock },
                { key: "goal-amount", label: "Goal Amount", icon: Target },
                { key: "contributor-count", label: "Most Backers", icon: Users }
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSortBy(key as SortBy)}
                  className="flex items-center gap-1"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Refresh and Results Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filtered.length} of {data?.length || 0} campaigns
            </Badge>
            {debouncedSearch && (
              <Badge variant="secondary">
                Searching: "{debouncedSearch}"
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => mutate()} disabled={isLoading}>
            <RefreshCcw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center text-muted-foreground py-8">
          <RefreshCcw className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading campaigns...
        </div>
      )}

      {/* Campaign Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CampaignCard key={String(c.id)} c={c} />
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && data && data.length > 0 && (
        <div className="text-center text-muted-foreground py-8">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No campaigns match your filters</h3>
          <p className="text-sm">Try adjusting your search or filter criteria</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
              setSortBy("recent")
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {!isLoading && data && data.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
          <p className="text-sm">Be the first to create a campaign!</p>
        </div>
      )}
    </div>
  )
}
