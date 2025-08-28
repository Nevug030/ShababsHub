import { NextRequest, NextResponse } from 'next/server'
import { QuizService } from '@/lib/quiz/service'

interface RouteContext {
  params: {
    roundId: string
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { roundId } = params
    const body = await request.json()
    const { correct_index } = body

    if (!roundId || correct_index === undefined) {
      return NextResponse.json(
        { error: 'roundId and correct_index are required' },
        { status: 400 }
      )
    }

    if (correct_index < 0 || correct_index > 3) {
      return NextResponse.json(
        { error: 'correct_index must be between 0 and 3' },
        { status: 400 }
      )
    }

    const quizService = new QuizService()
    const answers = await quizService.revealRound(roundId, correct_index)

    return NextResponse.json({ answers })

  } catch (error) {
    console.error('Error revealing quiz round:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
