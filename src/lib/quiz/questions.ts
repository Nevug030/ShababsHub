export interface QuizQuestion {
  question: string
  choices: string[]
  correct: number
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export const demoQuestions: QuizQuestion[] = [
  {
    question: 'Welcher Planet ist der Sonne am nächsten?',
    choices: ['Venus', 'Merkur', 'Mars', 'Erde'],
    correct: 1,
    category: 'Astronomie',
    difficulty: 'easy'
  },
  {
    question: 'Was ist die Hauptstadt von Kanada?',
    choices: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'],
    correct: 2,
    category: 'Geographie',
    difficulty: 'medium'
  },
  {
    question: 'Wer schrieb das Buch "1984"?',
    choices: ['Aldous Huxley', 'George Orwell', 'Ray Bradbury', 'Philip K. Dick'],
    correct: 1,
    category: 'Literatur',
    difficulty: 'medium'
  },
  {
    question: 'Welches Element hat das chemische Symbol "Au"?',
    choices: ['Silber', 'Gold', 'Aluminium', 'Argon'],
    correct: 1,
    category: 'Chemie',
    difficulty: 'easy'
  },
  {
    question: 'In welchem Jahr fiel die Berliner Mauer?',
    choices: ['1987', '1988', '1989', '1990'],
    correct: 2,
    category: 'Geschichte',
    difficulty: 'easy'
  },
  {
    question: 'Welcher ist der längste Fluss der Welt?',
    choices: ['Amazonas', 'Nil', 'Mississippi', 'Jangtse'],
    correct: 1,
    category: 'Geographie',
    difficulty: 'medium'
  },
  {
    question: 'Wer komponierte "Die vier Jahreszeiten"?',
    choices: ['Bach', 'Mozart', 'Vivaldi', 'Beethoven'],
    correct: 2,
    category: 'Musik',
    difficulty: 'medium'
  },
  {
    question: 'Wie viele Herzen hat ein Oktopus?',
    choices: ['1', '2', '3', '4'],
    correct: 2,
    category: 'Biologie',
    difficulty: 'hard'
  },
  {
    question: 'Welches ist das kleinste Land der Welt?',
    choices: ['Monaco', 'Nauru', 'Vatikanstadt', 'San Marino'],
    correct: 2,
    category: 'Geographie',
    difficulty: 'medium'
  },
  {
    question: 'Was bedeutet "www" in einer Webadresse?',
    choices: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'],
    correct: 0,
    category: 'Technologie',
    difficulty: 'easy'
  },
  {
    question: 'Welcher Künstler malte "Die Sternennacht"?',
    choices: ['Picasso', 'Van Gogh', 'Monet', 'Renoir'],
    correct: 1,
    category: 'Kunst',
    difficulty: 'easy'
  },
  {
    question: 'Wie heißt die Hauptstadt von Australien?',
    choices: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    correct: 2,
    category: 'Geographie',
    difficulty: 'medium'
  },
  {
    question: 'Welche Programmiersprache wurde von Guido van Rossum entwickelt?',
    choices: ['Java', 'Python', 'JavaScript', 'Ruby'],
    correct: 1,
    category: 'Technologie',
    difficulty: 'medium'
  },
  {
    question: 'Wie viele Minuten hat ein Fußballspiel (ohne Verlängerung)?',
    choices: ['80', '90', '100', '120'],
    correct: 1,
    category: 'Sport',
    difficulty: 'easy'
  },
  {
    question: 'Welches Gas macht den größten Teil der Erdatmosphäre aus?',
    choices: ['Sauerstoff', 'Kohlendioxid', 'Stickstoff', 'Wasserstoff'],
    correct: 2,
    category: 'Wissenschaft',
    difficulty: 'medium'
  }
]

/**
 * Get a random set of questions for a quiz
 */
export function getRandomQuestions(count: number = 10): QuizQuestion[] {
  const shuffled = [...demoQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, demoQuestions.length))
}

/**
 * Get questions by difficulty
 */
export function getQuestionsByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 10
): QuizQuestion[] {
  const filtered = demoQuestions.filter(q => q.difficulty === difficulty)
  const shuffled = filtered.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, filtered.length))
}

/**
 * Get questions by category
 */
export function getQuestionsByCategory(
  category: string,
  count: number = 10
): QuizQuestion[] {
  const filtered = demoQuestions.filter(q => q.category === category)
  const shuffled = filtered.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, filtered.length))
}
