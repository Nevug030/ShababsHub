import RoomClient from './room-client'

// For static export - generate some example room codes
export function generateStaticParams() {
  return [
    { code: 'DEMO01' },
    { code: 'TEST02' },
    { code: 'SAMPLE' },
  ]
}

interface RoomPageProps {
  params: {
    code: string
  }
}

export default function RoomPage({ params }: RoomPageProps) {
  return <RoomClient code={params.code} />
}