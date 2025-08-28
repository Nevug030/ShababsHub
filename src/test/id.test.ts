import { describe, it, expect } from 'vitest'
import { generateRoomCode, generatePlayerId, isValidRoomCode, isValidDisplayName } from '@/lib/id'

describe('ID Generation', () => {
  describe('generateRoomCode', () => {
    it('should generate a 6-character code', () => {
      const code = generateRoomCode()
      expect(code).toHaveLength(6)
    })

    it('should only contain safe characters', () => {
      const code = generateRoomCode()
      const safeChars = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/
      expect(code).toMatch(safeChars)
    })

    it('should not contain confusing characters', () => {
      const code = generateRoomCode()
      const confusingChars = /[O01IL]/
      expect(code).not.toMatch(confusingChars)
    })

    it('should generate unique codes', () => {
      const codes = new Set()
      const iterations = 1000
      
      for (let i = 0; i < iterations; i++) {
        codes.add(generateRoomCode())
      }
      
      // Should have high uniqueness (allow for some collisions in 1000 iterations)
      expect(codes.size).toBeGreaterThan(iterations * 0.95)
    })
  })

  describe('generatePlayerId', () => {
    it('should generate a UUID v4', () => {
      const id = generatePlayerId()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      expect(id).toMatch(uuidRegex)
    })

    it('should generate unique IDs', () => {
      const id1 = generatePlayerId()
      const id2 = generatePlayerId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('isValidRoomCode', () => {
    it('should validate correct room codes', () => {
      expect(isValidRoomCode('A2B3C4')).toBe(true)
      expect(isValidRoomCode('ZXYWVQ')).toBe(true)
      expect(isValidRoomCode('234567')).toBe(true)
    })

    it('should reject invalid room codes', () => {
      expect(isValidRoomCode('23456')).toBe(false) // too short
      expect(isValidRoomCode('2345678')).toBe(false) // too long
      expect(isValidRoomCode('A2B3C0')).toBe(false) // contains 0
      expect(isValidRoomCode('A2B3CO')).toBe(false) // contains O
      expect(isValidRoomCode('A2B3CI')).toBe(false) // contains I
      expect(isValidRoomCode('A2B3C1')).toBe(false) // contains 1
      expect(isValidRoomCode('')).toBe(false) // empty
      expect(isValidRoomCode('a2b3c4')).toBe(false) // lowercase
    })
  })

  describe('isValidDisplayName', () => {
    it('should validate correct display names', () => {
      expect(isValidDisplayName('Jo')).toBe(true)
      expect(isValidDisplayName('Alice')).toBe(true)
      expect(isValidDisplayName('Player123')).toBe(true)
      expect(isValidDisplayName('A'.repeat(20))).toBe(true) // exactly 20 chars
    })

    it('should reject invalid display names', () => {
      expect(isValidDisplayName('J')).toBe(false) // too short
      expect(isValidDisplayName('A'.repeat(21))).toBe(false) // too long
      expect(isValidDisplayName('')).toBe(false) // empty
      expect(isValidDisplayName('   ')).toBe(false) // only whitespace
    })

    it('should handle whitespace correctly', () => {
      expect(isValidDisplayName('  Jo  ')).toBe(true) // will be trimmed to 'Jo'
      expect(isValidDisplayName('  J  ')).toBe(false) // will be trimmed to 'J' (too short)
    })
  })
})
