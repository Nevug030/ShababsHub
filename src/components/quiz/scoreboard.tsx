"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, User } from "lucide-react"
import type { PlayerScore } from "@/types/quiz"

interface ScoreboardProps {
  scores: PlayerScore[]
  currentPlayerId?: string
  maxVisible?: number
  showStats?: boolean
}

export function Scoreboard({ 
  scores, 
  currentPlayerId, 
  maxVisible = 5,
  showStats = true 
}: ScoreboardProps) {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score)
  const topScores = sortedScores.slice(0, maxVisible)
  
  // Find current player if not in top scores
  const currentPlayerScore = currentPlayerId 
    ? scores.find(s => s.player_id === currentPlayerId)
    : null
  
  const currentPlayerRank = currentPlayerId 
    ? sortedScores.findIndex(s => s.player_id === currentPlayerId) + 1
    : 0

  const showCurrentPlayer = currentPlayerScore && 
    currentPlayerRank > maxVisible && 
    currentPlayerId

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2: return <Medal className="h-5 w-5 text-gray-400" />
      case 3: return <Award className="h-5 w-5 text-amber-600" />
      default: return <span className="text-sm font-medium w-5 text-center">{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-500/10 border-yellow-500/20"
      case 2: return "bg-gray-400/10 border-gray-400/20"
      case 3: return "bg-amber-600/10 border-amber-600/20"
      default: return ""
    }
  }

  if (scores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Scoreboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Noch keine Punkte...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Scoreboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topScores.map((score, index) => {
            const rank = index + 1
            const isCurrentPlayer = score.player_id === currentPlayerId
            
            return (
              <div
                key={score.player_id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  getRankColor(rank)
                } ${
                  isCurrentPlayer ? 'ring-2 ring-primary/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(rank)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {score.display_name}
                      </span>
                      {isCurrentPlayer && (
                        <Badge variant="outline" className="text-xs">
                          Du
                        </Badge>
                      )}
                    </div>
                    {showStats && score.totalAnswers > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {score.correctAnswers}/{score.totalAnswers} richtig
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {score.score}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Punkte
                  </div>
                </div>
              </div>
            )
          })}
          
          {showCurrentPlayer && currentPlayerScore && (
            <>
              <div className="border-t pt-3">
                <div className="text-sm text-muted-foreground mb-2 text-center">
                  Dein Rang: #{currentPlayerRank}
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border ring-2 ring-primary/50">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {currentPlayerScore.display_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Du
                        </Badge>
                      </div>
                      {showStats && currentPlayerScore.totalAnswers > 0 && (
                        <div className="text-sm text-muted-foreground">
                          {currentPlayerScore.correctAnswers}/{currentPlayerScore.totalAnswers} richtig
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {currentPlayerScore.score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Punkte
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
