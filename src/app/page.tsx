import { Header } from "@/components/common/header"
import { Footer } from "@/components/common/footer"
import { Hero } from "@/components/common/hero"
import { GameCard } from "@/components/common/game-card"
import { games } from "@/lib/games"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero />
        
        {/* Games Section */}
        <section id="games-section" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Wähle dein Spiel
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Von klassischen Rätseln bis zu kreativen Herausforderungen - 
                hier findest du das perfekte Spiel für jeden Anlass.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
