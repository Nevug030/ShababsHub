import { v4 as uuidv4 } from 'uuid'

/**
 * Generate a unique player ID using UUID v4
 */
export function generatePlayerId(): string {
  return uuidv4()
}

/**
 * Generate a 6-character room code using A-Z and 0-9
 * Excludes confusing characters: O, 0, I, 1, L
 */
export function generateRoomCode(): string {
  // Safe characters to avoid confusion
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let code = ''
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}

/**
 * Validate room code format
 */
export function isValidRoomCode(code: string): boolean {
  if (!code || code.length !== 6) return false
  
  const validChars = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/
  return validChars.test(code)
}

/**
 * Validate display name
 */
export function isValidDisplayName(name: string): boolean {
  if (!name) return false
  
  const trimmed = name.trim()
  return trimmed.length >= 2 && trimmed.length <= 20
}

