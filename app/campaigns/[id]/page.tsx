import { CampaignDetail } from "@/components/campaign-detail"

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-pretty">Campaign Details</h1>
      </header>
      <CampaignDetail id={params.id} />
    </main>
  )
}
