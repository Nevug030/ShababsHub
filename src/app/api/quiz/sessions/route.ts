import { NextRequest, NextResponse } from 'next/server'
import { QuizService } from '@/lib/quiz/service'
import type { CreateQuizSessionRequest } from '@/types/quiz'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateQuizSessionRequest
    const { room_id, created_by } = body

    if (!room_id || !created_by) {
      return NextResponse.json(
        { error: 'room_id and created_by are required' },
        { status: 400 }
      )
    }

    const quizService = new QuizService()
    const session = await quizService.startSession({ room_id, created_by })

    return NextResponse.json({ session })

  } catch (error) {
    console.error('Error creating quiz session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
