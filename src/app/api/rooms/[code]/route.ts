import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidRoomCode, isValidDisplayName, generatePlayerId } from '@/lib/id'
import type { JoinRoomRequest, RoomDetailsResponse } from '@/types/rooms'

interface RouteContext {
  params: {
    code: string
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const { code } = params

    // Validate room code format
    if (!isValidRoomCode(code)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      )
    }

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Check if room is open
    if (room.status !== 'open') {
      return NextResponse.json(
        { error: 'Room is not accepting new players' },
        { status: 409 }
      )
    }

    // Get current players
    const { data: players, error: playersError } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', room.id)
      .order('joined_at', { ascending: true })

    if (playersError) {
      console.error('Failed to get room players:', playersError)
      return NextResponse.json(
        { error: 'Failed to get room details' },
        { status: 500 }
      )
    }

    const response: RoomDetailsResponse = {
      room,
      players: players || []
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error getting room details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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
    const body = await request.json() as JoinRoomRequest
    const { display_name, player_id } = body

    // Validate inputs
    if (!isValidRoomCode(code)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      )
    }

    if (!isValidDisplayName(display_name)) {
      return NextResponse.json(
        { error: 'Display name must be between 2 and 20 characters' },
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
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    if (room.status !== 'open') {
      return NextResponse.json(
        { error: 'Room is not accepting new players' },
        { status: 409 }
      )
    }

    // Check if player already exists in room
    const { data: existingPlayer } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', room.id)
      .eq('player_id', player_id)
      .single()

    if (existingPlayer) {
      // Player already in room, update display name if different
      if (existingPlayer.display_name !== display_name.trim()) {
        await supabase
          .from('room_players')
          .update({ display_name: display_name.trim() })
          .eq('id', existingPlayer.id)
      }
      
      return NextResponse.json({ message: 'Already in room' })
    }

    // Add player to room
    const { error: joinError } = await supabase
      .from('room_players')
      .insert({
        room_id: room.id,
        player_id,
        display_name: display_name.trim(),
        is_host: false
      })

    if (joinError) {
      console.error('Failed to join room:', joinError)
      return NextResponse.json(
        { error: 'Failed to join room' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Successfully joined room' })

  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

