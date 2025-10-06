import { WalletConnect } from "@/components/wallet-connect"
import { CreateCampaignForm } from "@/components/create-campaign-form"
import { CampaignList } from "@/components/campaign-list"

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-pretty">Crowdfunding Platform</h1>
        <WalletConnect />
      </header>

      <section aria-labelledby="create-title" className="space-y-4">
        <h2 id="create-title" className="text-xl font-semibold">
          Create Campaign
        </h2>
        <CreateCampaignForm />
      </section>

      <section aria-labelledby="browse-title" className="space-y-4">
        <h2 id="browse-title" className="text-xl font-semibold">
          Browse Campaigns
        </h2>
        <CampaignList />
      </section>
    </main>
  )
}
