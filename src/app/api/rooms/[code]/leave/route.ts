import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidRoomCode } from '@/lib/id'

interface RouteContext {
  params: {
    code: string
  }
}

interface LeaveRoomRequest {
  player_id: string
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const { code } = params
    const body = await request.json() as LeaveRoomRequest
    const { player_id } = body

    // Validate inputs
    if (!isValidRoomCode(code)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      )
    }

    if (!player_id) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    // Get room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Remove player from room
    const { error: leaveError } = await supabase
      .from('room_players')
      .delete()
      .eq('room_id', room.id)
      .eq('player_id', player_id)

    if (leaveError) {
      console.error('Failed to leave room:', leaveError)
      return NextResponse.json(
        { error: 'Failed to leave room' },
        { status: 500 }
      )
    }

    // Check if room is now empty and close it
    const { data: remainingPlayers } = await supabase
      .from('room_players')
      .select('id')
      .eq('room_id', room.id)

    if (!remainingPlayers || remainingPlayers.length === 0) {
      // Close empty room
      await supabase
        .from('rooms')
        .update({ status: 'closed' })
        .eq('id', room.id)
    }

    return NextResponse.json({ message: 'Successfully left room' })

  } catch (error) {
    console.error('Error leaving room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

