"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

export function Hero() {
  const scrollToGames = () => {
    const gamesSection = document.getElementById('games-section')
    if (gamesSection) {
      gamesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Spiele mit Freunden{" "}
          <span className="text-primary">direkt im Browser</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Keine Downloads, keine Registrierung - einfach Spiel auswählen und loslegen!
        </p>
        
        <Button 
          size="lg" 
          onClick={scrollToGames}
          className="text-lg px-8 py-6 h-auto"
          aria-label="Zu den Spielen scrollen"
        >
          Spiel auswählen
          <ArrowDown className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}
