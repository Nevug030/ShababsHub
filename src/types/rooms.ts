export interface Room {
  id: string
  code: string
  status: 'open' | 'closed' | 'in_game'
  created_at: string
}

export interface RoomPlayer {
  id: string
  room_id: string
  player_id: string
  display_name: string
  is_host: boolean
  joined_at: string
}

export interface CreateRoomRequest {
  display_name: string
  player_id?: string
}

export interface CreateRoomResponse {
  code: string
  player_id: string
  room: Room
}

export interface JoinRoomRequest {
  display_name: string
  player_id: string
}

export interface RoomDetailsResponse {
  room: Room
  players: RoomPlayer[]
}

// Realtime Types
export interface PresenceState {
  player_id: string
  display_name: string
  is_host: boolean
}

export interface BroadcastEvent {
  type: 'wave' | 'message' | 'game_event'
  from: string
  payload?: any
}

export interface WaveBroadcast extends BroadcastEvent {
  type: 'wave'
  from: string
}

// Error Types
export interface RoomError {
  code: 'ROOM_NOT_FOUND' | 'ROOM_CLOSED' | 'INVALID_CODE' | 'PLAYER_EXISTS' | 'CONNECTION_ERROR'
  message: string
}

