import { describe, it, expect } from 'vitest'
import {
  createRoomCode,
  cleanRoomCode,
  isValidRoomCode,
  ROOM_CODE_ALPHABET,
  ROOM_CODE_REGEX,
} from '../lib/room'

describe('Room Code & Validation Logic', () => {
  it('generates a 12-character cryptographic room code', () => {
    const code = createRoomCode()
    expect(code).toHaveLength(12)
    expect(isValidRoomCode(code)).toBe(true)
  })

  it('uses only characters from the defined un-ambiguous alphabet', () => {
    for (let i = 0; i < 50; i++) {
      const code = createRoomCode()
      for (const char of code) {
        expect(ROOM_CODE_ALPHABET).toContain(char)
        // Ensure easily confused characters (0, O, 1, I) are excluded
        expect(['0', 'O', '1', 'I']).not.toContain(char)
      }
    }
  })

  it('cleans and normalizes user input for room codes', () => {
    // Normalizes lowercase, dashes, spaces, and invalid chars
    expect(cleanRoomCode('abc-def-gh2-345')).toBe('ABCDEFGH2345')
    expect(cleanRoomCode('   7k2m-9x4w-8q9p   ')).toBe('7K2M9X4W8Q9P')
    // Strips invalid characters such as '1' or 'O'
    expect(cleanRoomCode('7K2M-9X4W-8Q1P')).toBe('7K2M9X4W8QP')
    expect(cleanRoomCode('7K2M9X4W8Q9P')).toBe('7K2M9X4W8Q9P')
  })

  it('validates correct and incorrect room codes', () => {
    expect(isValidRoomCode('7K2M9X4W8Q9P')).toBe(true)
    expect(isValidRoomCode('ABCDEFGHJKL2')).toBe(true)

    // Rejects incorrect length
    expect(isValidRoomCode('ABCDEF')).toBe(false)
    expect(isValidRoomCode('ABCDEFGHJKL2X')).toBe(false)

    // Rejects excluded characters (0, O, 1, I)
    expect(isValidRoomCode('0BCDEFGHJKL2')).toBe(false)
    expect(isValidRoomCode('OBCDEFGHJKL2')).toBe(false)
    expect(isValidRoomCode('1BCDEFGHJKL2')).toBe(false)
    expect(isValidRoomCode('IBCDEFGHJKL2')).toBe(false)

    // Rejects symbols
    expect(isValidRoomCode('ABC-DEF-GH23')).toBe(false)
  })

  it('generates unique codes with sufficient entropy', () => {
    const generated = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      const code = createRoomCode()
      expect(generated.has(code)).toBe(false)
      generated.add(code)
    }
    expect(generated.size).toBe(1000)
  })
})
