import QuizClient from './quiz-client'

// For static export - generate some example room codes
export function generateStaticParams() {
  return [
    { code: 'DEMO01' },
    { code: 'TEST02' },
    { code: 'SAMPLE' },
  ]
}

interface QuizPageProps {
  params: {
    code: string
  }
}

export default function QuizPage({ params }: QuizPageProps) {
  return <QuizClient code={params.code} />
}