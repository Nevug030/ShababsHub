"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ToastContextProvider, useToast } from "@/components/ui/toast"
import { Scoreboard } from "@/components/quiz/scoreboard"
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle,
  Trophy,
  Loader2
} from "lucide-react"
import { getOrCreatePlayer } from "@/lib/storage"
import { getRandomQuestions } from "@/lib/quiz/questions"
import type { PlayerScore } from "@/types/quiz"
import type { QuizQuestion } from "@/lib/quiz/questions"

interface QuizPageContentProps {
  code: string
}

interface QuizState {
  phase: 'waiting' | 'answering' | 'revealing' | 'ended'
  currentQuestion: QuizQuestion | null
  myAnswer: number | null
  timeLeft: number
  scores: PlayerScore[]
  currentRound: number
  totalRounds: number
}

function QuizPageContent({ code }: QuizPageContentProps) {
  const router = useRouter()
  const { addToast } = useToast()
  
  const [currentPlayer, setCurrentPlayer] = useState<{ id: string, name: string } | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  
  const [quizState, setQuizState] = useState<QuizState>({
    phase: 'waiting',
    currentQuestion: null,
    myAnswer: null,
    timeLeft: 0,
    scores: [],
    currentRound: 0,
    totalRounds: 10
  })

  // Initialize player
  useEffect(() => {
    const player = getOrCreatePlayer()
    setCurrentPlayer(player)
    setIsHost(true) // For MVP, assume first player is host
    setIsLoading(false)
  }, [])

  // Timer countdown
  useEffect(() => {
    if (quizState.phase !== 'answering' || quizState.timeLeft <= 0) return

    const timer = setInterval(() => {
      setQuizState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [quizState.phase, quizState.timeLeft])

  // Auto-reveal when timer reaches 0
  useEffect(() => {
    if (quizState.phase === 'answering' && quizState.timeLeft === 0) {
      setQuizState(prev => ({ ...prev, phase: 'revealing' }))
      
      setTimeout(() => {
        if (quizState.currentRound < quizState.totalRounds) {
          nextRound()
        } else {
          endQuiz()
        }
      }, 3000) // Show reveal for 3 seconds
    }
  }, [quizState.phase, quizState.timeLeft])

  const startQuiz = () => {
    const quizQuestions = getRandomQuestions(10)
    setQuestions(quizQuestions)
    
    setQuizState(prev => ({
      ...prev,
      phase: 'waiting',
      currentRound: 0,
      scores: []
    }))

    addToast({
      title: "Quiz gestartet!",
      description: "Das Quiz beginnt gleich..."
    })

    // Start first round after delay
    setTimeout(() => startRound(1, quizQuestions[0]), 2000)
  }

  const startRound = (roundNo: number, question: QuizQuestion) => {
    setQuizState(prev => ({
      ...prev,
      phase: 'answering',
      currentQuestion: question,
      currentRound: roundNo,
      myAnswer: null,
      timeLeft: 20 // 20 seconds per question
    }))

    addToast({
      title: `Runde ${roundNo}/${quizState.totalRounds}`,
      description: "Neue Frage ist da!"
    })
  }

  const submitAnswer = (choiceIndex: number) => {
    if (quizState.myAnswer !== null) return

    setQuizState(prev => ({ ...prev, myAnswer: choiceIndex }))
    
    addToast({
      title: "Antwort gesendet!",
      description: `Du hast ${String.fromCharCode(65 + choiceIndex)} gewählt`
    })
  }

  const nextRound = () => {
    const nextRoundNo = quizState.currentRound + 1
    
    if (nextRoundNo <= questions.length) {
      // Calculate score for this round
      if (quizState.currentQuestion && quizState.myAnswer === quizState.currentQuestion.correct) {
        setQuizState(prev => ({
          ...prev,
          scores: prev.scores.map(s => 
            s.player_id === currentPlayer?.id 
              ? { ...s, score: s.score + 1, correctAnswers: s.correctAnswers + 1 }
              : s
          ).concat(prev.scores.length === 0 && currentPlayer ? [{
            player_id: currentPlayer.id,
            display_name: currentPlayer.name,
            score: 1,
            correctAnswers: 1,
            totalAnswers: quizState.currentRound
          }] : [])
        }))
      }

      setTimeout(() => startRound(nextRoundNo, questions[nextRoundNo - 1]), 1000)
    } else {
      endQuiz()
    }
  }

  const endQuiz = () => {
    setQuizState(prev => ({ ...prev, phase: 'ended' }))
    
    addToast({
      title: "Quiz beendet!",
      description: "Danke fürs Mitspielen!"
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => router.push(`/room/${code}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Raum
          </Button>
          
          <Badge variant="outline" className="text-lg px-4 py-2">
            Quiz - Raum {code}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Quiz Area */}
          <div className="lg:col-span-2 space-y-6">
            {quizState.phase === 'waiting' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6" />
                    Quiz bereit
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-6">
                    Bereit für ein spannendes Quiz mit 10 Fragen?
                  </p>
                  {isHost ? (
                    <Button onClick={startQuiz} size="lg" className="px-8">
                      <Play className="h-5 w-5 mr-2" />
                      Quiz starten
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Warte auf den Host...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {quizState.phase === 'answering' && quizState.currentQuestion && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Frage {quizState.currentRound}/{quizState.totalRounds}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className={`text-lg font-bold ${
                        quizState.timeLeft <= 5 ? 'text-red-500' : ''
                      }`}>
                        {quizState.timeLeft}s
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h2 className="text-xl font-semibold mb-6">
                    {quizState.currentQuestion.question}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quizState.currentQuestion.choices.map((choice, index) => (
                      <Button
                        key={index}
                        variant={quizState.myAnswer === index ? "default" : "outline"}
                        className="h-auto p-4 text-left justify-start"
                        onClick={() => submitAnswer(index)}
                        disabled={quizState.myAnswer !== null}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {choice}
                      </Button>
                    ))}
                  </div>

                  {quizState.myAnswer !== null && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">
                          Antwort gesendet: {String.fromCharCode(65 + quizState.myAnswer)}. {quizState.currentQuestion.choices[quizState.myAnswer]}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {quizState.phase === 'revealing' && quizState.currentQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Auflösung - Frage {quizState.currentRound}/{quizState.totalRounds}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h2 className="text-xl font-semibold mb-6">
                    {quizState.currentQuestion.question}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quizState.currentQuestion.choices.map((choice, index) => {
                      const isCorrect = index === quizState.currentQuestion!.correct
                      const wasMyAnswer = index === quizState.myAnswer
                      
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            isCorrect 
                              ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400'
                              : wasMyAnswer
                              ? 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400'
                              : 'bg-muted border-muted-foreground/20'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : wasMyAnswer ? (
                              <XCircle className="h-5 w-5" />
                            ) : null}
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {choice}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-lg">
                      {quizState.myAnswer === quizState.currentQuestion.correct ? (
                        <span className="text-green-600 font-semibold">🎉 Richtig!</span>
                      ) : (
                        <span className="text-red-600 font-semibold">😔 Falsch</span>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {quizState.phase === 'ended' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
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

export default function QuizPage() {
  const params = useParams()
  const code = params.code as string

  return (
    <ToastContextProvider>
      <QuizPageContent code={code} />
    </ToastContextProvider>
  )
}