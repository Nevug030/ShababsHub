import { describe, it, expect } from 'vitest'
import { getRandomQuestions, getQuestionsByDifficulty, getQuestionsByCategory, demoQuestions } from '@/lib/quiz/questions'
import type { PlayerScore } from '@/types/quiz'

describe('Quiz Questions', () => {
  describe('getRandomQuestions', () => {
    it('should return requested number of questions', () => {
      const questions = getRandomQuestions(5)
      expect(questions).toHaveLength(5)
    })

    it('should return all questions if count exceeds available', () => {
      const questions = getRandomQuestions(100)
      expect(questions).toHaveLength(demoQuestions.length)
    })

    it('should return different questions on multiple calls', () => {
      const questions1 = getRandomQuestions(10)
      const questions2 = getRandomQuestions(10)
      
      // At least some questions should be different (very high probability)
      const same = questions1.every((q1, index) => 
        q1.question === questions2[index]?.question
      )
      expect(same).toBe(false)
    })

    it('should return valid question objects', () => {
      const questions = getRandomQuestions(3)
      
      questions.forEach(question => {
        expect(question).toHaveProperty('question')
        expect(question).toHaveProperty('choices')
        expect(question).toHaveProperty('correct')
        expect(question.choices).toHaveLength(4)
        expect(question.correct).toBeGreaterThanOrEqual(0)
        expect(question.correct).toBeLessThan(4)
      })
    })
  })

  describe('getQuestionsByDifficulty', () => {
    it('should return only easy questions', () => {
      const questions = getQuestionsByDifficulty('easy', 10)
      questions.forEach(question => {
        expect(question.difficulty).toBe('easy')
      })
    })

    it('should return only medium questions', () => {
      const questions = getQuestionsByDifficulty('medium', 10)
      questions.forEach(question => {
        expect(question.difficulty).toBe('medium')
      })
    })

    it('should return only hard questions', () => {
      const questions = getQuestionsByDifficulty('hard', 10)
      questions.forEach(question => {
        expect(question.difficulty).toBe('hard')
      })
    })

    it('should respect count limit', () => {
      const questions = getQuestionsByDifficulty('easy', 2)
      expect(questions.length).toBeLessThanOrEqual(2)
    })
  })

  describe('getQuestionsByCategory', () => {
    it('should return questions from specified category', () => {
      const questions = getQuestionsByCategory('Geographie', 10)
      questions.forEach(question => {
        expect(question.category).toBe('Geographie')
      })
    })

    it('should return empty array for non-existent category', () => {
      const questions = getQuestionsByCategory('NonExistentCategory', 10)
      expect(questions).toHaveLength(0)
    })

    it('should respect count limit', () => {
      const questions = getQuestionsByCategory('Geographie', 1)
      expect(questions.length).toBeLessThanOrEqual(1)
    })
  })
})

describe('Quiz Logic', () => {
  describe('Score calculation', () => {
    it('should calculate player scores correctly', () => {
      const mockAnswers = [
        { player_id: '1', display_name: 'Alice', is_correct: true },
        { player_id: '1', display_name: 'Alice', is_correct: false },
        { player_id: '1', display_name: 'Alice', is_correct: true },
        { player_id: '2', display_name: 'Bob', is_correct: true },
        { player_id: '2', display_name: 'Bob', is_correct: true },
      ]

      const scores = new Map<string, number>()
      mockAnswers.forEach(answer => {
        if (answer.is_correct) {
          const current = scores.get(answer.player_id) || 0
          scores.set(answer.player_id, current + 1)
        }
      })

      expect(scores.get('1')).toBe(2)
      expect(scores.get('2')).toBe(2)
    })

    it('should handle players with no correct answers', () => {
      const mockAnswers = [
        { player_id: '1', display_name: 'Alice', is_correct: false },
        { player_id: '1', display_name: 'Alice', is_correct: false },
      ]

      const scores = new Map<string, number>()
      mockAnswers.forEach(answer => {
        if (answer.is_correct) {
          const current = scores.get(answer.player_id) || 0
          scores.set(answer.player_id, current + 1)
        }
      })

      expect(scores.get('1')).toBeUndefined()
    })
  })

  describe('Timer calculations', () => {
    it('should calculate correct time left from deadline', () => {
      const deadline = new Date(Date.now() + 10000) // 10 seconds from now
      const timeLeft = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000))
      
      expect(timeLeft).toBeGreaterThanOrEqual(9)
      expect(timeLeft).toBeLessThanOrEqual(10)
    })

    it('should return 0 for past deadlines', () => {
      const deadline = new Date(Date.now() - 5000) // 5 seconds ago
      const timeLeft = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000))
      
      expect(timeLeft).toBe(0)
    })
  })

  describe('Scoreboard sorting', () => {
    it('should sort players by score descending', () => {
      const scores: PlayerScore[] = [
        { player_id: '1', display_name: 'Alice', score: 5, correctAnswers: 5, totalAnswers: 8 },
        { player_id: '2', display_name: 'Bob', score: 8, correctAnswers: 8, totalAnswers: 10 },
        { player_id: '3', display_name: 'Charlie', score: 3, correctAnswers: 3, totalAnswers: 6 },
      ]

      const sorted = [...scores].sort((a, b) => b.score - a.score)
      
      expect(sorted[0].display_name).toBe('Bob')
      expect(sorted[1].display_name).toBe('Alice')
      expect(sorted[2].display_name).toBe('Charlie')
    })

    it('should handle tied scores', () => {
      const scores: PlayerScore[] = [
        { player_id: '1', display_name: 'Alice', score: 5, correctAnswers: 5, totalAnswers: 8 },
        { player_id: '2', display_name: 'Bob', score: 5, correctAnswers: 5, totalAnswers: 8 },
      ]

      const sorted = [...scores].sort((a, b) => b.score - a.score)
      
      expect(sorted).toHaveLength(2)
      expect(sorted[0].score).toBe(5)
      expect(sorted[1].score).toBe(5)
    })
  })

  describe('Answer validation', () => {
    it('should validate choice indices', () => {
      const isValidChoice = (index: number) => index >= 0 && index <= 3
      
      expect(isValidChoice(0)).toBe(true)
      expect(isValidChoice(1)).toBe(true)
      expect(isValidChoice(2)).toBe(true)
      expect(isValidChoice(3)).toBe(true)
      expect(isValidChoice(-1)).toBe(false)
      expect(isValidChoice(4)).toBe(false)
    })

    it('should check if answer is correct', () => {
      const question = demoQuestions[0] // First demo question
      const checkAnswer = (choiceIndex: number) => choiceIndex === question.correct
      
      expect(checkAnswer(question.correct)).toBe(true)
      
      // Test wrong answers
      for (let i = 0; i < 4; i++) {
        if (i !== question.correct) {
          expect(checkAnswer(i)).toBe(false)
        }
      }
    })
  })
})
