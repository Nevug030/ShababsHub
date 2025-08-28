"use client"

import { useState } from "react"
import { Game } from "@/lib/games"
import { GameCard } from "@/components/common/game-card"

interface GameTabsProps {
  games: Game[]
}

export function GameTabs({ games }: GameTabsProps) {
  const [active, setActive] = useState<"rooms" | "single">("rooms")

  const roomsGames = games.filter((g) => g.mode === "rooms")
  const singleGames = games.filter((g) => g.mode === "single")

  return (
    <section aria-labelledby="games-tabs-heading" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 id="games-tabs-heading" className="text-3xl md:text-4xl font-bold">
            Spiele auswählen
          </h2>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Spielkategorien" className="flex justify-center gap-2 mb-8">
          <button
            role="tab"
            aria-selected={active === "rooms"}
            aria-controls="tab-panel-rooms"
            id="tab-rooms"
            onClick={() => setActive("rooms")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              active === "rooms"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-muted hover:bg-muted"
            }`}
          >
            Multiplayer (Räume)
          </button>

          <button
            role="tab"
            aria-selected={active === "single"}
            aria-controls="tab-panel-single"
            id="tab-single"
            onClick={() => setActive("single")}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              active === "single"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-muted hover:bg-muted"
            }`}
          >
            1 Telefon
          </button>
        </div>

        {/* Panels */}
        <div className="max-w-6xl mx-auto">
          <div
            role="tabpanel"
            id="tab-panel-rooms"
            aria-labelledby="tab-rooms"
            hidden={active !== "rooms"}
          >
            <p className="text-center text-muted-foreground mb-6">
              Spiele, die du mit mehreren Personen in einem gemeinsamen Raum spielst – live synchronisiert.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomsGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>

          <div
            role="tabpanel"
            id="tab-panel-single"
            aria-labelledby="tab-single"
            hidden={active !== "single"}
          >
            <p className="text-center text-muted-foreground mb-6">
              Spiele, die mit einem einzigen Telefon funktionieren – ideal für unterwegs oder zu zweit.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {singleGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


