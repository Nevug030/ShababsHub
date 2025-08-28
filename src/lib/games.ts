import { LucideIcon } from "lucide-react"
import { 
  Brain, 
  MapPin, 
  Users, 
  Zap, 
  MessageSquare, 
  Target 
} from "lucide-react"

export interface Game {
  id: string
  name: string
  slug: string
  description: string
  minPlayers: number
  maxPlayers: number
  tags: string[]
  icon: LucideIcon
  comingSoon?: boolean
}

export const games: Game[] = [
  {
    id: "quiz",
    name: "Quiz",
    slug: "quiz",
    description: "Teste dein Wissen in verschiedenen Kategorien gegen deine Freunde",
    minPlayers: 2,
    maxPlayers: 8,
    tags: ["Wissen", "Echtzeit", "Kompetitiv"],
    icon: Brain,
  },
  {
    id: "stadt-land-fluss",
    name: "Stadt-Land-Fluss",
    slug: "stadt-land-fluss",
    description: "Der Klassiker neu interpretiert - finde Begriffe zu verschiedenen Kategorien",
    minPlayers: 2,
    maxPlayers: 6,
    tags: ["Kreativität", "Klassiker", "Schnell"],
    icon: MapPin,
  },
  {
    id: "wer-bin-ich",
    name: "Wer bin ich?",
    slug: "wer-bin-ich",
    description: "Rate die Persönlichkeit auf deiner Stirn durch geschickte Fragen",
    minPlayers: 3,
    maxPlayers: 8,
    tags: ["Raten", "Party", "Lustig"],
    icon: Users,
  },
  {
    id: "blitzrunde",
    name: "Blitzrunde",
    slug: "blitzrunde",
    description: "Schnelle Fragen, schnelle Antworten - wer ist am schnellsten?",
    minPlayers: 2,
    maxPlayers: 10,
    tags: ["Schnell", "Reaktion", "Echtzeit"],
    icon: Zap,
    comingSoon: true,
  },
  {
    id: "storytelling",
    name: "Story Building",
    slug: "storytelling",
    description: "Erschafft gemeinsam verrückte Geschichten - Satz für Satz",
    minPlayers: 3,
    maxPlayers: 8,
    tags: ["Kreativität", "Kooperativ", "Lustig"],
    icon: MessageSquare,
    comingSoon: true,
  },
  {
    id: "zielscheibe",
    name: "Zielscheibe",
    slug: "zielscheibe",
    description: "Schätze Zahlen und Werte so nah wie möglich an das Ziel",
    minPlayers: 2,
    maxPlayers: 6,
    tags: ["Schätzen", "Strategie", "Präzision"],
    icon: Target,
    comingSoon: true,
  },
]

export function getGameBySlug(slug: string): Game | undefined {
  return games.find(game => game.slug === slug)
}

