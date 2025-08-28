import { NextRequest, NextResponse } from 'next/server'
import { QuizService } from '@/lib/quiz/service'
import type { StartRoundRequest } from '@/types/quiz'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as StartRoundRequest
    const { session_id, round_no, question } = body

    if (!session_id || round_no === undefined || !question) {
      return NextResponse.json(
        { error: 'session_id, round_no, and question are required' },
        { status: 400 }
      )
    }

    const quizService = new QuizService()
    const round = await quizService.startRound({ session_id, round_no, question })

    return NextResponse.json({ round })

  } catch (error) {
    console.error('Error creating quiz round:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
