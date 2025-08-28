import type { QuizQuestion } from '@/lib/quiz/questions'

// Database Types
export interface QuizSession {
  id: string
  room_id: string
  status: 'idle' | 'running' | 'ended'
  current_round: number
  created_by: string
  created_at: string
  ended_at?: string
}

export interface QuizRound {
  id: string
  session_id: string
  round_no: number
  question: string
  choices: string[]
  correct_index: number
  started_at: string
  revealed_at?: string
}

export interface QuizAnswer {
  id: string
  round_id: string
  player_id: string
  display_name: string
  choice_index: number
  submitted_at: string
  is_correct?: boolean
}

// API Types
export interface CreateQuizSessionRequest {
  room_id: string
  created_by: string
}

export interface CreateQuizSessionResponse {
  session: QuizSession
}

export interface StartRoundRequest {
  session_id: string
  round_no: number
  question: QuizQuestion
}

export interface StartRoundResponse {
  round: QuizRound
}

export interface SubmitAnswerRequest {
  round_id: string
  player_id: string
  display_name: string
  choice_index: number
}

export interface RevealRoundRequest {
  round_id: string
  correct_index: number
}

// Realtime Event Types
export interface QuizBroadcastEvent {
  type: 'quiz'
  action: 'start' | 'round_start' | 'answer' | 'lock' | 'reveal' | 'next' | 'end'
  payload: any
}

export interface QuizStartEvent extends QuizBroadcastEvent {
  action: 'start'
  payload: {
    sessionId: string
    hostId: string
  }
}

export interface QuizRoundStartEvent extends QuizBroadcastEvent {
  action: 'round_start'
  payload: {
    roundId: string
    roundNo: number
    question: string
    choices: string[]
    deadline: string // ISO timestamp
    totalRounds: number
  }
}

export interface QuizAnswerEvent extends QuizBroadcastEvent {
  action: 'answer'
  payload: {
    from: {
      player_id: string
      display_name: string
    }
    choice_index: number
    hasAnswered: boolean
  }
}

export interface QuizLockEvent extends QuizBroadcastEvent {
  action: 'lock'
  payload: {
    roundId: string
  }
}

export interface QuizRevealEvent extends QuizBroadcastEvent {
  action: 'reveal'
  payload: {
    roundId: string
    correct_index: number
    correctAnswer: string
    answers: QuizAnswer[]
  }
}

export interface QuizNextEvent extends QuizBroadcastEvent {
  action: 'next'
  payload: {
    nextRoundNo: number
  }
}

export interface QuizEndEvent extends QuizBroadcastEvent {
  action: 'end'
  payload: {
    sessionId: string
    finalScores: PlayerScore[]
  }
}

// UI State Types
export interface QuizState {
  session: QuizSession | null
  currentRound: QuizRound | null
  currentQuestion: QuizQuestion | null
  myAnswer: number | null
  isLocked: boolean
  timeLeft: number
  phase: 'waiting' | 'answering' | 'locked' | 'revealing' | 'ended'
  answers: Map<string, number> // player_id -> choice_index
  scores: Map<string, number> // player_id -> total_score
}

export interface PlayerScore {
  player_id: string
  display_name: string
  score: number
  correctAnswers: number
  totalAnswers: number
}

// Timer Configuration
export interface QuizTimerConfig {
  roundDuration: number // seconds
  revealDuration: number // seconds
  betweenRoundsDuration: number // seconds
}

export const DEFAULT_QUIZ_CONFIG: QuizTimerConfig = {
  roundDuration: 20,
  revealDuration: 5,
  betweenRoundsDuration: 3
}
