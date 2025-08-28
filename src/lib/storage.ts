import { generatePlayerId } from './id'

export interface Player {
  id: string
  name: string
}

const PLAYER_KEY = 'party-games-player'

/**
 * Get player from localStorage, generate new one if not exists
 */
export function getPlayer(): Player | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(PLAYER_KEY)
    if (!stored) return null
    
    const player = JSON.parse(stored) as Player
    
    // Validate stored player
    if (!player.id || !player.name) return null
    
    return player
  } catch (error) {
    console.warn('Failed to get player from localStorage:', error)
    return null
  }
}

/**
 * Save player to localStorage
 */
export function savePlayer(player: Player): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(player))
  } catch (error) {
    console.warn('Failed to save player to localStorage:', error)
  }
}

/**
 * Get or create player with given name
 */
export function getOrCreatePlayer(displayName?: string): Player {
  const existingPlayer = getPlayer()
  
  if (existingPlayer && displayName && existingPlayer.name !== displayName) {
    // Update name if provided and different
    const updatedPlayer = { ...existingPlayer, name: displayName }
    savePlayer(updatedPlayer)
    return updatedPlayer
  }
  
  if (existingPlayer) {
    return existingPlayer
  }
  
  // Create new player
  const newPlayer: Player = {
    id: generatePlayerId(),
    name: displayName || 'Anonymous'
  }
  
  savePlayer(newPlayer)
  return newPlayer
}

/**
 * Clear player from localStorage
 */
export function clearPlayer(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(PLAYER_KEY)
  } catch (error) {
    console.warn('Failed to clear player from localStorage:', error)
  }
}

