import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import { Hero } from "@/components/common/hero"
import { GameTabs } from "@/components/common/game-tabs"
import { games } from "@/lib/games"

// Avoid static generation timeout on Vercel by rendering dynamically
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero />
        
        <GameTabs games={games} />
      </main>
      
      <Footer />
    </div>
  )
}
