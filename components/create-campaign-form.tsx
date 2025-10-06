"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { getWriteContract } from "@/lib/ethers"
import { toWei } from "@/lib/format"
import { useRouter } from "next/navigation"

export function CreateCampaignForm() {
  const [title, setTitle] = useState("")
  const [goalEth, setGoalEth] = useState("")
  const [deadline, setDeadline] = useState("") // datetime-local
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const contract = await getWriteContract()
      const deadlineSeconds = Math.floor(new Date(deadline).getTime() / 1000)
      const tx = await contract.createCampaign(title, toWei(goalEth), deadlineSeconds, description)
      await tx.wait()
      // refresh page data
      router.refresh()
      setTitle("")
      setGoalEth("")
      setDeadline("")
      setDescription("")
    } catch (err: any) {
      console.error("[v0] createCampaign error:", err?.message || err)
      alert(err?.shortMessage || err?.message || "Create campaign failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 p-4 rounded-lg border bg-card text-card-foreground">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Save the Rainforest"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="goal">Goal (ETH)</Label>
        <Input
          id="goal"
          value={goalEth}
          type="number"
          step="0.0001"
          min="0"
          onChange={(e) => setGoalEth(e.target.value)}
          placeholder="10"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="deadline">Deadline</Label>
        <Input
          id="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell supporters why this matters..."
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create Campaign"}
      </Button>
    </form>
  )
}
