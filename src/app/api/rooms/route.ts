import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateRoomCode, generatePlayerId, isValidDisplayName } from '@/lib/id'
import type { CreateRoomRequest, CreateRoomResponse } from '@/types/rooms'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    const body = await request.json() as CreateRoomRequest
    const { display_name, player_id } = body

    // Validate display name
    if (!isValidDisplayName(display_name)) {
      return NextResponse.json(
        { error: 'Display name must be between 2 and 20 characters' },
        { status: 400 }
      )
    }

    // Generate or use provided player_id
    const finalPlayerId = player_id || generatePlayerId()

    // Generate unique room code (max 5 attempts)
    let roomCode = ''
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      roomCode = generateRoomCode()
      
      // Check if code already exists
      const { data: existingRoom } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', roomCode)
        .single()

      if (!existingRoom) {
        break // Code is unique
      }
      
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique room code. Please try again.' },
        { status: 500 }
      )
    }

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        code: roomCode,
        status: 'open'
      })
      .select()
      .single()

    if (roomError) {
      console.error('Failed to create room:', roomError)
      return NextResponse.json(
        { error: 'Failed to create room' },
        { status: 500 }
      )
    }

    // Add creator as host player
    const { error: playerError } = await supabase
      .from('room_players')
      .insert({
        room_id: room.id,
        player_id: finalPlayerId,
        display_name: display_name.trim(),
        is_host: true
      })

    if (playerError) {
      console.error('Failed to add host player:', playerError)
      
      // Clean up room if player insertion failed
      await supabase.from('rooms').delete().eq('id', room.id)
      
      return NextResponse.json(
        { error: 'Failed to create room' },
        { status: 500 }
      )
    }

    const response: CreateRoomResponse = {
      code: roomCode,
      player_id: finalPlayerId,
      room
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

