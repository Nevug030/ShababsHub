import { NextRequest, NextResponse } from 'next/server'
import { QuizService } from '@/lib/quiz/service'
import type { SubmitAnswerRequest } from '@/types/quiz'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SubmitAnswerRequest
    const { round_id, player_id, display_name, choice_index } = body

    if (!round_id || !player_id || !display_name || choice_index === undefined) {
      return NextResponse.json(
        { error: 'round_id, player_id, display_name, and choice_index are required' },
        { status: 400 }
      )
    }

    if (choice_index < 0 || choice_index > 3) {
      return NextResponse.json(
        { error: 'choice_index must be between 0 and 3' },
        { status: 400 }
      )
    }

    const quizService = new QuizService()
    const answer = await quizService.submitAnswer({
      round_id,
      player_id,
      display_name,
      choice_index
    })

    return NextResponse.json({ answer })

  } catch (error) {
    console.error('Error submitting quiz answer:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
