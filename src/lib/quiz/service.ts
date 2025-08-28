import { createClient } from '@/lib/supabase/server'
import type { 
  QuizSession, 
  QuizRound, 
  QuizAnswer, 
  CreateQuizSessionRequest,
  StartRoundRequest,
  SubmitAnswerRequest,
  PlayerScore 
} from '@/types/quiz'
import type { QuizQuestion } from './questions'

export class QuizService {
  private supabase = createClient()

  /**
   * Start a new quiz session for a room
   */
  async startSession(request: CreateQuizSessionRequest): Promise<QuizSession> {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    // End any existing active sessions for this room
    await this.supabase
      .from('quiz_sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('room_id', request.room_id)
      .eq('status', 'running')

    // Create new session
    const { data: session, error } = await this.supabase
      .from('quiz_sessions')
      .insert({
        room_id: request.room_id,
        created_by: request.created_by,
        status: 'running',
        current_round: 0
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create quiz session: ${error.message}`)
    }

    return session
  }

  /**
   * Start a new round in the quiz
   */
  async startRound(request: StartRoundRequest): Promise<QuizRound> {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    const { data: round, error } = await this.supabase
      .from('quiz_rounds')
      .insert({
        session_id: request.session_id,
        round_no: request.round_no,
        question: request.question.question,
        choices: request.question.choices,
        correct_index: request.question.correct
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create quiz round: ${error.message}`)
    }

    // Update session current round
    await this.supabase
      .from('quiz_sessions')
      .update({ current_round: request.round_no })
      .eq('id', request.session_id)

    return round
  }

  /**
   * Submit a player's answer
   */
  async submitAnswer(request: SubmitAnswerRequest): Promise<QuizAnswer> {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    const { data: answer, error } = await this.supabase
      .from('quiz_answers')
      .upsert({
        round_id: request.round_id,
        player_id: request.player_id,
        display_name: request.display_name,
        choice_index: request.choice_index
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to submit answer: ${error.message}`)
    }

    return answer
  }

  /**
   * Reveal the round results and calculate scores
   */
  async revealRound(roundId: string, correctIndex: number): Promise<QuizAnswer[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    // Mark round as revealed
    await this.supabase
      .from('quiz_rounds')
      .update({ revealed_at: new Date().toISOString() })
      .eq('id', roundId)

    // Update all answers with correct/incorrect flag
    await this.supabase
      .from('quiz_answers')
      .update({ is_correct: false })
      .eq('round_id', roundId)

    await this.supabase
      .from('quiz_answers')
      .update({ is_correct: true })
      .eq('round_id', roundId)
      .eq('choice_index', correctIndex)

    // Get all answers for this round
    const { data: answers, error } = await this.supabase
      .from('quiz_answers')
      .select('*')
      .eq('round_id', roundId)

    if (error) {
      throw new Error(`Failed to get round answers: ${error.message}`)
    }

    return answers || []
  }

  /**
   * Get current session for a room
   */
  async getCurrentSession(roomId: string): Promise<QuizSession | null> {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    const { data: session, error } = await this.supabase
      .from('quiz_sessions')
      .select('*')
      .eq('room_id', roomId)
      .eq('status', 'running')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw new Error(`Failed to get current session: ${error.message}`)
    }

    return session || null
  }

  /**
   * Get current round for a session
   */
  async getCurrentRound(sessionId: string): Promise<QuizRound | null> {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    const { data: round, error } = await this.supabase
      .from('quiz_rounds')
      .select('*')
      .eq('session_id', sessionId)
      .order('round_no', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw new Error(`Failed to get current round: ${error.message}`)
    }

    return round || null
  }

  /**
   * Get player scores for a session
   */
  async getSessionScores(sessionId: string): Promise<PlayerScore[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    const { data, error } = await this.supabase
      .from('quiz_answers')
      .select(`
        player_id,
        display_name,
        is_correct,
        quiz_rounds!inner (
          session_id
        )
      `)
      .eq('quiz_rounds.session_id', sessionId)

    if (error) {
      throw new Error(`Failed to get session scores: ${error.message}`)
    }

    // Aggregate scores by player
    const scoreMap = new Map<string, PlayerScore>()
    
    data?.forEach((answer: any) => {
      const playerId = answer.player_id
      if (!scoreMap.has(playerId)) {
        scoreMap.set(playerId, {
          player_id: playerId,
          display_name: answer.display_name,
          score: 0,
          correctAnswers: 0,
          totalAnswers: 0
        })
      }
      
      const playerScore = scoreMap.get(playerId)!
      playerScore.totalAnswers++
      
      if (answer.is_correct === true) {
        playerScore.score++
        playerScore.correctAnswers++
      }
    })

    return Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
  }

  /**
   * End a quiz session
   */
  async endSession(sessionId: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    const { error } = await this.supabase
      .from('quiz_sessions')
      .update({ 
        status: 'ended', 
        ended_at: new Date().toISOString() 
      })
      .eq('id', sessionId)

    if (error) {
      throw new Error(`Failed to end session: ${error.message}`)
    }
  }

  /**
   * Get answers for a specific round
   */
  async getRoundAnswers(roundId: string): Promise<QuizAnswer[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not available')
    }

    const { data: answers, error } = await this.supabase
      .from('quiz_answers')
      .select('*')
      .eq('round_id', roundId)
      .order('submitted_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to get round answers: ${error.message}`)
    }

    return answers || []
  }
}
