import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Game } from "@/lib/games"
import { Users } from "lucide-react"

interface GameCardProps {
  game: Game
}

export function GameCard({ game }: GameCardProps) {
  const Icon = game.icon

  return (
    <Card className="group h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6" />
          </div>
          {game.comingSoon && (
            <Badge variant="secondary" className="text-xs">
              Bald verfügbar
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl">{game.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {game.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {game.minPlayers === game.maxPlayers 
              ? `${game.minPlayers} Spieler`
              : `${game.minPlayers}-${game.maxPlayers} Spieler`
            }
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {game.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          asChild 
          className="w-full" 
          disabled={game.comingSoon}
          aria-label={`${game.name} ${game.comingSoon ? '- Bald verfügbar' : 'öffnen'}`}
        >
          <Link href={`/${game.slug}`}>
            {game.comingSoon ? "Bald verfügbar" : "Öffnen"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

