import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getGameBySlug, games } from "@/lib/games"
import { ArrowLeft, Users, Clock } from "lucide-react"
import type { Metadata } from "next"

interface GamePageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  return games.map((game) => ({
    slug: game.slug,
  }))
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const game = getGameBySlug(params.slug)
  
  if (!game) {
    return {
      title: "Spiel nicht gefunden",
    }
  }

  return {
    title: `${game.name} - Party Games`,
    description: game.description,
    openGraph: {
      title: `${game.name} - Party Games`,
      description: game.description,
      type: "website",
    },
  }
}

export default function GamePage({ params }: GamePageProps) {
  const game = getGameBySlug(params.slug)

  if (!game) {
    notFound()
  }

  const Icon = game.icon

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button variant="outline" asChild className="mb-8">
          <Link href="/" aria-label="Zurück zur Startseite">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Startseite
          </Link>
        </Button>

        {/* Game Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-6 rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-16 w-16" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold">{game.name}</h1>
            {game.comingSoon && (
              <Badge variant="secondary">Bald verfügbar</Badge>
            )}
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            {game.description}
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {game.minPlayers === game.maxPlayers 
                  ? `${game.minPlayers} Spieler`
                  : `${game.minPlayers}-${game.maxPlayers} Spieler`
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>10-30 Min</span>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {game.comingSoon ? "Bald verfügbar!" : "Coming Soon!"}
            </CardTitle>
            <CardDescription className="text-lg">
              {game.comingSoon 
                ? "Wir arbeiten hart daran, dieses Spiel für dich fertigzustellen."
                : "Dieses Spiel befindet sich noch in der Entwicklung."
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Spielkategorien:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {game.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Folge uns für Updates oder kehre später zurück, um zu sehen, wann {game.name} verfügbar ist!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/">Andere Spiele entdecken</Link>
                </Button>
                <Button variant="outline" disabled>
                  Benachrichtigung aktivieren
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
