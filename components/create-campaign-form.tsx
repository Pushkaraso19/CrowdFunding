"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getWriteContract } from "@/lib/ethers"
import { toWei, toEth } from "@/lib/format"
import { useRouter } from "next/navigation"
import { useSWRConfig } from "swr"
import { 
  Target, 
  Clock, 
  FileText, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Sparkles,
  Calendar,
  Loader2
} from "lucide-react"

type FormErrors = {
  title?: string
  goalEth?: string
  deadline?: string
  description?: string
}

export function CreateCampaignForm() {
  const [title, setTitle] = useState("")
  const [goalEth, setGoalEth] = useState("")
  const [deadline, setDeadline] = useState("") // datetime-local
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const router = useRouter()
  const { mutate } = useSWRConfig()

  // Set minimum deadline to current time + 1 hour
  const minDeadline = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)

  // Validation functions
  const validateTitle = (value: string): string | undefined => {
    if (!value.trim()) return "Title is required"
    if (value.length < 5) return "Title must be at least 5 characters"
    if (value.length > 100) return "Title must be less than 100 characters"
    return undefined
  }

  const validateGoal = (value: string): string | undefined => {
    if (!value) return "Goal amount is required"
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0) return "Goal must be a positive number"
    if (num < 0.001) return "Minimum goal is 0.001 ETH"
    if (num > 1000000) return "Maximum goal is 1,000,000 ETH"
    return undefined
  }

  const validateDeadline = (value: string): string | undefined => {
    if (!value) return "Deadline is required"
    const deadlineDate = new Date(value)
    const now = new Date()
    const minDate = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
    const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
    
    if (deadlineDate <= minDate) return "Deadline must be at least 1 hour from now"
    if (deadlineDate > maxDate) return "Deadline cannot be more than 1 year from now"
    return undefined
  }

  const validateDescription = (value: string): string | undefined => {
    if (!value.trim()) return "Description is required"
    if (value.length < 20) return "Description must be at least 20 characters"
    if (value.length > 1000) return "Description must be less than 1000 characters"
    return undefined
  }

  // Real-time validation
  useEffect(() => {
    const newErrors: FormErrors = {}
    if (title) newErrors.title = validateTitle(title)
    if (goalEth) newErrors.goalEth = validateGoal(goalEth)
    if (deadline) newErrors.deadline = validateDeadline(deadline)
    if (description) newErrors.description = validateDescription(description)
    setErrors(newErrors)
  }, [title, goalEth, deadline, description])

  // Check if form is valid
  const isFormValid = title && goalEth && deadline && description && 
    !errors.title && !errors.goalEth && !errors.deadline && !errors.description

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")
    
    // Final validation
    const finalErrors: FormErrors = {
      title: validateTitle(title),
      goalEth: validateGoal(goalEth),
      deadline: validateDeadline(deadline),
      description: validateDescription(description)
    }
    
    // Remove undefined errors
    Object.keys(finalErrors).forEach(key => {
      if (!finalErrors[key as keyof FormErrors]) {
        delete finalErrors[key as keyof FormErrors]
      }
    })
    
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors)
      return
    }
    
    try {
      setSubmitting(true)
      setErrors({})
      
      const contract = await getWriteContract()
      const deadlineSeconds = Math.floor(new Date(deadline).getTime() / 1000)
      const tx = await contract.createCampaign(title, toWei(goalEth), deadlineSeconds, description)
      await tx.wait()
      
      // Force SWR to re-fetch the campaigns list immediately
      await mutate("campaigns")
      
      // Show success message
      setSuccessMessage("🎉 Campaign created successfully! It will appear in the browse section shortly.")
      
      // Reset form
      setTitle("")
      setGoalEth("")
      setDeadline("")
      setDescription("")
      setShowPreview(false)
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000)
      
    } catch (err: any) {
      console.error("[v0] createCampaign error:", err?.message || err)
      const errorMessage = err?.shortMessage || err?.message || "Failed to create campaign"
      setErrors({ title: errorMessage })
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setGoalEth("")
    setDeadline("")
    setDescription("")
    setErrors({})
    setSuccessMessage("")
    setShowPreview(false)
  }

  const getDaysUntilDeadline = () => {
    if (!deadline) return 0
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form Card */}
        <Card className="order-2 lg:order-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Create Your Campaign
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Campaign Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Save the Local Animal Shelter"
                  className={errors.title ? "border-red-500" : ""}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{errors.title || "Make it compelling and clear"}</span>
                  <span className={title.length > 80 ? "text-orange-600" : ""}>
                    {title.length}/100
                  </span>
                </div>
              </div>

              {/* Goal Field */}
              <div className="space-y-2">
                <Label htmlFor="goal" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Funding Goal (ETH)
                </Label>
                <Input
                  id="goal"
                  value={goalEth}
                  type="number"
                  step="0.0001"
                  min="0.001"
                  max="1000000"
                  onChange={(e) => setGoalEth(e.target.value)}
                  placeholder="10.0"
                  className={errors.goalEth ? "border-red-500" : ""}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{errors.goalEth || "Set a realistic funding target"}</span>
                  {goalEth && !errors.goalEth && (
                    <span>≈ ${(parseFloat(goalEth) * 2000).toLocaleString()} USD</span>
                  )}
                </div>
              </div>

              {/* Deadline Field */}
              <div className="space-y-2">
                <Label htmlFor="deadline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Campaign Deadline
                </Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  min={minDeadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={errors.deadline ? "border-red-500" : ""}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{errors.deadline || "When should your campaign end?"}</span>
                  {deadline && !errors.deadline && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getDaysUntilDeadline()} days from now
                    </span>
                  )}
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="desc" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Campaign Description
                </Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell your story! Explain what you're raising money for, why it matters, and how the funds will be used. Be specific about your goals and timeline."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{errors.description || "Paint a picture of your mission"}</span>
                  <span className={description.length > 800 ? "text-orange-600" : ""}>
                    {description.length}/1000
                  </span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={submitting || !isFormValid}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Reset
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={!isFormValid}
                >
                  {showPreview ? "Hide" : "Preview"}
                </Button>
              </div>

              {/* Form Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Form Completion</span>
                  <span>{Math.round((Object.values({ title, goalEth, deadline, description }).filter(Boolean).length / 4) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${(Object.values({ title, goalEth, deadline, description }).filter(Boolean).length / 4) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview/Help Card */}
        <Card className="order-1 lg:order-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {showPreview ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Campaign Preview
                </>
              ) : (
                <>
                  <Info className="h-5 w-5" />
                  Tips for Success
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showPreview && isFormValid ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {goalEth} ETH
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getDaysUntilDeadline()} days
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div className="h-2 bg-primary rounded-full w-0 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-4">{description}</p>
                <Badge variant="outline">
                  Active Campaign Preview
                </Badge>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Set Realistic Goals
                  </h4>
                  <p className="text-muted-foreground">
                    Research similar campaigns and set achievable funding targets. Consider your network size and campaign timeline.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Tell Your Story
                  </h4>
                  <p className="text-muted-foreground">
                    Be specific about what you're raising money for and how it will be used. Transparency builds trust.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Choose the Right Timeline
                  </h4>
                  <p className="text-muted-foreground">
                    30-60 days is often optimal. Too short creates pressure, too long loses momentum.
                  </p>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Once created, campaign details cannot be changed. Double-check everything before submitting!
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
