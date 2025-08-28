"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToastContextProvider, useToast } from "@/components/ui/toast"
import { ArrowLeft, Clock, Users, Trophy, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/browser"
import { getOrCreatePlayer } from "@/lib/storage"
import { isValidRoomCode } from "@/lib/id"
import { Scoreboard } from "@/components/quiz/scoreboard"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { Room, RoomPlayer, PresenceState } from "@/types/rooms"
import type { 
  QuizState, 
  QuizBroadcastEvent, 
  QuizStartEvent, 
  QuizRoundStartEvent,
  QuizPlayerAnswerEvent,
  QuizAnswersLockedEvent,
  QuizRevealEvent,
  QuizEndEvent,
  PlayerScore,
  DEFAULT_QUIZ_CONFIG
} from "@/types/quiz"

interface QuizClientProps {
  code: string
}

function QuizPageContent({ code }: QuizClientProps) {
  const router = useRouter()
  const { addToast } = useToast()
  
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [presence, setPresence] = useState<Record<string, PresenceState>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<{ id: string; name: string } | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isHost, setIsHost] = useState(false)
  
  // Quiz state
  const [quizState, setQuizState] = useState<QuizState>({
    phase: 'waiting',
    currentRound: 0,
    totalRounds: DEFAULT_QUIZ_CONFIG.totalRounds,
    currentQuestion: null,
    playerAnswers: new Map(),
    scores: new Map(),
    timeLeft: 0,
    deadline: null,
  })

  // Validate room code
  if (!isValidRoomCode(code)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Ungültiger Raumcode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Der Raumcode &quot;{code}&quot; ist ungültig.</p>
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Startseite
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Load room data
  const loadRoom = useCallback(async () => {
    if (!code) return

    try {
      const response = await fetch(`/api/rooms/${code}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load room')
      }

      setRoom(data.room)
      setPlayers(data.players || [])
      setError(null)
    } catch (err) {
      console.error('Failed to load room:', err)
      setError(err instanceof Error ? err.message : 'Failed to load room')
    } finally {
      setIsLoading(false)
    }
  }, [code])

  // Quiz event handlers
  const handleQuizStart = useCallback((event: QuizStartEvent) => {
    setQuizState(prev => ({
      ...prev,
      phase: 'waiting',
      currentRound: 0,
      totalRounds: event.total_rounds,
      scores: new Map(),
    }))
    addToast({
      title: "🎯 Quiz gestartet!",
      description: `Quiz mit ${event.total_rounds} Runden beginnt.`,
    })
  }, [addToast])

  const handleRoundStart = useCallback((event: QuizRoundStartEvent) => {
    const deadline = new Date(event.deadline)
    const timeLeft = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000))

    setQuizState(prev => ({
      ...prev,
      phase: 'answering',
      currentRound: event.round_number,
      currentQuestion: event.question,
      playerAnswers: new Map(),
      timeLeft,
      deadline: event.deadline,
    }))

    addToast({
      title: `📝 Runde ${event.round_number}`,
      description: "Neue Frage ist da! Zeit läuft...",
    })
  }, [addToast])

  const handlePlayerAnswer = useCallback((event: QuizPlayerAnswerEvent) => {
    setQuizState(prev => {
      const newAnswers = new Map(prev.playerAnswers)
      newAnswers.set(event.player_id, {
        choice_index: event.choice_index,
        timestamp: event.timestamp,
      })
      return {
        ...prev,
        playerAnswers: newAnswers,
      }
    })
  }, [])

  const handleAnswersLocked = useCallback((event: QuizAnswersLockedEvent) => {
    setQuizState(prev => ({
      ...prev,
      timeLeft: 0,
    }))
    addToast({
      title: "⏰ Zeit abgelaufen!",
      description: "Antworten werden ausgewertet...",
    })
  }, [addToast])

  const handleReveal = useCallback((event: QuizRevealEvent) => {
    setQuizState(prev => {
      const newScores = new Map(prev.scores)
      
      // Update scores based on correct answers
      event.correct_players.forEach(playerId => {
        const currentScore = newScores.get(playerId) || { score: 0, correct_answers: 0, total_answers: 0 }
        newScores.set(playerId, {
          score: currentScore.score + event.points_awarded,
          correct_answers: currentScore.correct_answers + 1,
          total_answers: currentScore.total_answers + 1,
        })
      })

      // Update total answers for incorrect players
      prev.playerAnswers.forEach((_, playerId) => {
        if (!event.correct_players.includes(playerId)) {
          const currentScore = newScores.get(playerId) || { score: 0, correct_answers: 0, total_answers: 0 }
          newScores.set(playerId, {
            ...currentScore,
            total_answers: currentScore.total_answers + 1,
          })
        }
      })

      return {
        ...prev,
        phase: 'revealing',
        scores: newScores,
      }
    })

    const isCorrect = currentPlayer && event.correct_players.includes(currentPlayer.id)
    addToast({
      title: isCorrect ? "🎉 Richtig!" : "❌ Falsch",
      description: isCorrect 
        ? `+${event.points_awarded} Punkte!` 
        : `Richtige Antwort: ${event.correct_choice}`,
    })
  }, [addToast, currentPlayer])

  const handleQuizEnd = useCallback((event: QuizEndEvent) => {
    setQuizState(prev => ({
      ...prev,
      phase: 'ended',
    }))
    
    const topPlayer = event.final_scores[0]
    addToast({
      title: "🏆 Quiz beendet!",
      description: topPlayer ? `Gewinner: ${topPlayer.display_name}` : "Danke fürs Mitspielen!",
    })
  }, [addToast])

  const handleQuizEvent = useCallback((payload: any) => {
    const event = payload.payload as QuizBroadcastEvent
    
    switch (event.action) {
      case 'start':
        handleQuizStart(event as QuizStartEvent)
        break
      case 'round_start':
        handleRoundStart(event as QuizRoundStartEvent)
        break
      case 'answer':
        handlePlayerAnswer(event as QuizPlayerAnswerEvent)
        break
      case 'lock':
        handleAnswersLocked(event as QuizAnswersLockedEvent)
        break
      case 'reveal':
        handleReveal(event as QuizRevealEvent)
        break
      case 'end':
        handleQuizEnd(event as QuizEndEvent)
        break
    }
  }, [handleQuizStart, handleRoundStart, handlePlayerAnswer, handleAnswersLocked, handleReveal, handleQuizEnd])

  // Host actions
  const startQuiz = useCallback(async () => {
    if (!isHost) return

    try {
      const response = await fetch('/api/quiz/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_code: code,
          total_rounds: DEFAULT_QUIZ_CONFIG.totalRounds,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to start quiz')
      }

      // Quiz started event will be broadcasted
    } catch (err) {
      console.error('Failed to start quiz:', err)
      addToast({
        title: "Fehler",
        description: err instanceof Error ? err.message : 'Quiz konnte nicht gestartet werden',
        variant: "destructive",
      })
    }
  }, [isHost, code, addToast])

  const nextRound = useCallback(async () => {
    if (!isHost) return

    try {
      const response = await fetch('/api/quiz/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_code: code,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to start round')
      }

      // Round started event will be broadcasted
    } catch (err) {
      console.error('Failed to start round:', err)
      addToast({
        title: "Fehler",
        description: err instanceof Error ? err.message : 'Runde konnte nicht gestartet werden',
        variant: "destructive",
      })
    }
  }, [isHost, code, addToast])

  const lockAnswers = useCallback(async () => {
    if (!isHost || !channel) return

    await channel.send({
      type: 'broadcast',
      event: 'quiz',
      payload: {
        type: 'quiz',
        action: 'lock',
        timestamp: new Date().toISOString(),
      } as QuizAnswersLockedEvent,
    })
  }, [isHost, channel])

  const revealAnswer = useCallback(async () => {
    if (!isHost || !quizState.currentQuestion) return

    try {
      // This would typically call an API to reveal the answer
      // For now, we'll simulate it
      const correctIndex = quizState.currentQuestion.correct_index
      const correctPlayers: string[] = []
      
      quizState.playerAnswers.forEach((answer, playerId) => {
        if (answer.choice_index === correctIndex) {
          correctPlayers.push(playerId)
        }
      })

      const revealEvent: QuizRevealEvent = {
        type: 'quiz',
        action: 'reveal',
        round_number: quizState.currentRound,
        correct_index: correctIndex,
        correct_choice: quizState.currentQuestion.choices[correctIndex],
        correct_players: correctPlayers,
        points_awarded: DEFAULT_QUIZ_CONFIG.pointsPerQuestion,
        timestamp: new Date().toISOString(),
      }

      await channel?.send({
        type: 'broadcast',
        event: 'quiz',
        payload: revealEvent,
      })
    } catch (err) {
      console.error('Failed to reveal answer:', err)
      addToast({
        title: "Fehler",
        description: "Antwort konnte nicht aufgelöst werden",
        variant: "destructive",
      })
    }
  }, [isHost, quizState, channel, addToast])

  const endQuiz = useCallback(async () => {
    if (!isHost || !channel) return

    // Calculate final scores
    const finalScores: Array<{ player_id: string; display_name: string; score: number }> = []
    
    quizState.scores.forEach((score, playerId) => {
      const player = players.find(p => p.player_id === playerId)
      if (player) {
        finalScores.push({
          player_id: playerId,
          display_name: player.display_name,
          score: score.score,
        })
      }
    })

    finalScores.sort((a, b) => b.score - a.score)

    const endEvent: QuizEndEvent = {
      type: 'quiz',
      action: 'end',
      final_scores: finalScores,
      timestamp: new Date().toISOString(),
    }

    await channel.send({
      type: 'broadcast',
      event: 'quiz',
      payload: endEvent,
    })
  }, [isHost, channel, quizState.scores, players])

  // Player actions
  const submitAnswer = useCallback(async (choiceIndex: number) => {
    if (!currentPlayer || !channel || quizState.phase !== 'answering') return

    try {
      const response = await fetch('/api/quiz/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_code: code,
          player_id: currentPlayer.id,
          choice_index: choiceIndex,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit answer')
      }

      // Broadcast answer to other players
      const answerEvent: QuizPlayerAnswerEvent = {
        type: 'quiz',
        action: 'answer',
        player_id: currentPlayer.id,
        choice_index: choiceIndex,
        timestamp: new Date().toISOString(),
      }

      await channel.send({
        type: 'broadcast',
        event: 'quiz',
        payload: answerEvent,
      })

      addToast({
        title: "✅ Antwort abgeschickt",
        description: `Du hast ${String.fromCharCode(65 + choiceIndex)} gewählt.`,
      })
    } catch (err) {
      console.error('Failed to submit answer:', err)
      addToast({
        title: "Fehler",
        description: err instanceof Error ? err.message : 'Antwort konnte nicht abgeschickt werden',
        variant: "destructive",
      })
    }
  }, [currentPlayer, channel, quizState.phase, code, addToast])

  // Timer effect
  useEffect(() => {
    if (quizState.phase === 'answering' && quizState.timeLeft > 0) {
      const timer = setInterval(() => {
        setQuizState(prev => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1),
        }))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizState.phase, quizState.timeLeft])

  // Auto-lock answers when time runs out
  useEffect(() => {
    if (isHost && quizState.phase === 'answering' && quizState.timeLeft === 0) {
      lockAnswers()
    }
  }, [isHost, quizState.phase, quizState.timeLeft, lockAnswers])

  // Initialize player and room
  useEffect(() => {
    const player = getOrCreatePlayer()
    setCurrentPlayer(player)
    loadRoom()
  }, [loadRoom])

  // Check if current player is host
  useEffect(() => {
    if (currentPlayer && players.length > 0) {
      const playerData = players.find(p => p.player_id === currentPlayer.id)
      setIsHost(playerData?.is_host || false)
    }
  }, [currentPlayer, players])

  // Setup Supabase Realtime
  useEffect(() => {
    if (!supabase || !currentPlayer || !room) return

    const roomChannel = supabase.channel(`room-${code}`)

    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = roomChannel.presenceState() as Record<string, PresenceState[]>
        const transformedPresence: Record<string, PresenceState> = {}
        
        Object.entries(presenceState).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            transformedPresence[key] = presences[0]
          }
        })
        
        setPresence(transformedPresence)
      })
      .on('broadcast', { event: 'quiz' }, handleQuizEvent)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          
          await roomChannel.track({
            player_id: currentPlayer.id,
            display_name: currentPlayer.name,
            is_host: players.find(p => p.player_id === currentPlayer.id)?.is_host || false,
            online_at: new Date().toISOString(),
          })
        } else {
          setIsConnected(false)
        }
      })

    setChannel(roomChannel)

    return () => {
      roomChannel.unsubscribe()
    }
  }, [supabase, currentPlayer, room, players, code, handleQuizEvent])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Lade Quiz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Fehler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error}</p>
              <div className="flex gap-2">
                <Button onClick={() => router.push(`/room/${code}`)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zum Raum
                </Button>
                <Button variant="outline" onClick={loadRoom}>
                  Erneut versuchen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Raum nicht gefunden</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Der Raum mit dem Code &quot;{code}&quot; existiert nicht.</p>
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Startseite
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentPlayerAnswer = currentPlayer ? quizState.playerAnswers.get(currentPlayer.id) : null
  const presenceList = Object.values(presence)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => router.push(`/room/${code}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Raum
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">🎯 Quiz - Raum {code}</h1>
            {isHost && <Badge variant="secondary">Host</Badge>}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {presenceList.length} online
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Quiz Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Waiting Phase */}
            {quizState.phase === 'waiting' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    {quizState.currentRound === 0 ? '🎯 Quiz bereit!' : 'Warte auf nächste Runde...'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {quizState.currentRound === 0 ? (
                    <>
                      <p className="text-lg mb-6">
                        Bereit für {quizState.totalRounds} spannende Fragen?
                      </p>
                      {isHost ? (
                        <Button onClick={startQuiz} size="lg">
                          Quiz starten
                        </Button>
                      ) : (
                        <p className="text-muted-foreground">
                          Warte auf den Host...
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-lg mb-6">
                        Runde {quizState.currentRound} von {quizState.totalRounds} abgeschlossen!
                      </p>
                      {isHost ? (
                        <div className="flex gap-2 justify-center">
                          {quizState.currentRound < quizState.totalRounds ? (
                            <Button onClick={nextRound} size="lg">
                              Nächste Runde
                            </Button>
                          ) : (
                            <Button onClick={endQuiz} size="lg">
                              Quiz beenden
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          Warte auf den Host...
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Question Phase */}
            {quizState.phase === 'answering' && quizState.currentQuestion && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Frage {quizState.currentRound} von {quizState.totalRounds}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className={`font-bold ${quizState.timeLeft <= 5 ? 'text-red-500' : ''}`}>
                        {quizState.timeLeft}s
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-lg font-medium p-4 bg-muted rounded-lg">
                    {quizState.currentQuestion.question}
                  </div>

                  <div className="grid gap-3">
                    {quizState.currentQuestion.choices.map((choice, index) => (
                      <Button
                        key={index}
                        variant={currentPlayerAnswer?.choice_index === index ? "default" : "outline"}
                        className="justify-start text-left h-auto p-4"
                        onClick={() => submitAnswer(index)}
                        disabled={!!currentPlayerAnswer || quizState.timeLeft === 0}
                      >
                        <span className="font-bold mr-3">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {choice}
                      </Button>
                    ))}
                  </div>

                  {currentPlayerAnswer && (
                    <div className="text-center text-sm text-muted-foreground">
                      ✅ Du hast {String.fromCharCode(65 + currentPlayerAnswer.choice_index)} gewählt
                    </div>
                  )}

                  {isHost && (
                    <div className="flex gap-2 justify-center pt-4 border-t">
                      <Button onClick={lockAnswers} variant="outline" size="sm">
                        Antworten sperren
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reveal Phase */}
            {quizState.phase === 'revealing' && quizState.currentQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Auflösung - Runde {quizState.currentRound}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-lg font-medium p-4 bg-muted rounded-lg">
                    {quizState.currentQuestion.question}
                  </div>

                  <div className="grid gap-3">
                    {quizState.currentQuestion.choices.map((choice, index) => {
                      const isCorrect = index === quizState.currentQuestion!.correct_index
                      const wasSelected = currentPlayerAnswer?.choice_index === index
                      
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            isCorrect 
                              ? 'bg-green-50 border-green-500 text-green-800' 
                              : wasSelected
                                ? 'bg-red-50 border-red-500 text-red-800'
                                : 'bg-muted border-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-bold">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span>{choice}</span>
                            {isCorrect && <span className="ml-auto">✅</span>}
                            {wasSelected && !isCorrect && <span className="ml-auto">❌</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {isHost && (
                    <div className="flex gap-2 justify-center pt-4 border-t">
                      {quizState.currentRound < quizState.totalRounds ? (
                        <Button onClick={nextRound} size="lg">
                          Nächste Runde
                        </Button>
                      ) : (
                        <Button onClick={endQuiz} size="lg">
                          Quiz beenden
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* End Phase */}
            {quizState.phase === 'ended' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <Trophy className="h-6 w-6" />
                    Quiz beendet!
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <p className="text-lg mb-6">
                    Danke fürs Mitspielen! 🎉
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => router.push(`/room/${code}`)}>
                      Zurück zum Raum
                    </Button>
                    {isHost && (
                      <Button variant="outline" onClick={() => setQuizState(prev => ({ ...prev, phase: 'waiting' }))}>
                        Neues Quiz
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Scoreboard */}
          <div className="space-y-6">
            <Scoreboard 
              scores={quizState.scores}
              currentPlayerId={currentPlayer?.id}
              maxVisible={5}
              showStats={true}
            />

            {/* Quiz Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quiz Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Runde:</span>
                  <span>{quizState.currentRound}/{quizState.totalRounds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phase:</span>
                  <Badge variant="outline" className="text-xs">
                    {quizState.phase === 'waiting' && 'Warten'}
                    {quizState.phase === 'answering' && 'Antworten'}
                    {quizState.phase === 'revealing' && 'Auflösung'}
                    {quizState.phase === 'ended' && 'Beendet'}
                  </Badge>
                </div>
                {quizState.timeLeft > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zeit:</span>
                    <span className={quizState.timeLeft <= 5 ? 'text-red-500 font-bold' : ''}>
                      {quizState.timeLeft}s
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QuizClient({ code }: QuizClientProps) {
  return (
    <ToastContextProvider>
      <QuizPageContent code={code} />
    </ToastContextProvider>
  )
}
