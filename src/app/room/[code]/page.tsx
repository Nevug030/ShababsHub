"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToastContextProvider, useToast } from "@/components/ui/toast"
import { ArrowLeft, Copy, Users, Wifi, WifiOff, Hand, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/browser"
import { getOrCreatePlayer } from "@/lib/storage"
import { isValidRoomCode } from "@/lib/id"
import type { Room, RoomPlayer, PresenceState, WaveBroadcast } from "@/types/rooms"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface RoomPageContentProps {
  code: string
}

function RoomPageContent({ code }: RoomPageContentProps) {
  const router = useRouter()
  const { addToast } = useToast()
  
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [presenceState, setPresenceState] = useState<Record<string, PresenceState>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<{ id: string, name: string } | null>(null)

  // Load room data
  const loadRoom = useCallback(async () => {
    if (!supabase) {
      setError('Supabase nicht verfügbar')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/rooms/${code}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Room not found')
      }

      const data = await response.json()
      setRoom(data.room)
      setPlayers(data.players)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load room')
    } finally {
      setIsLoading(false)
    }
  }, [code])

  // Setup realtime connection
  const setupRealtime = useCallback(async () => {
    if (!supabase || !room) return

    const player = getOrCreatePlayer()
    setCurrentPlayer(player)

    // Create channel
    const roomChannel = supabase.channel(`room-${code}`, {
      config: {
        presence: {
          key: player.id,
        },
      },
    })

    // Track presence
    const isHost = players.some(p => p.player_id === player.id && p.is_host)
    
    await roomChannel.track({
      player_id: player.id,
      display_name: player.name,
      is_host: isHost,
    })

    // Listen to presence changes
    roomChannel.on('presence', { event: 'sync' }, () => {
      const state = roomChannel.presenceState<PresenceState>()
      // Convert RealtimePresenceState to our expected format
      const formattedState: Record<string, PresenceState> = {}
      Object.entries(state).forEach(([key, presences]) => {
        if (presences.length > 0) {
          formattedState[key] = presences[0]
        }
      })
      setPresenceState(formattedState)
      setIsConnected(true)
    })

    roomChannel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      const newPlayer = newPresences[0]
      addToast({
        title: "Spieler beigetreten",
        description: `${newPlayer.display_name} ist dem Raum beigetreten`,
      })
    })

    roomChannel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      const leftPlayer = leftPresences[0]
      addToast({
        title: "Spieler verlassen",
        description: `${leftPlayer.display_name} hat den Raum verlassen`,
      })
    })

    // Listen to broadcasts
    roomChannel.on('broadcast', { event: 'wave' }, (payload) => {
      const broadcast = payload.payload as WaveBroadcast
      if (broadcast.from !== player.name) {
        addToast({
          title: "👋 Wave!",
          description: `${broadcast.from} winkt dir zu!`,
        })
      }
    })

    // Subscribe to channel
    roomChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setIsConnected(false)
        addToast({
          title: "Verbindung getrennt",
          description: "Versuche zu reconnecten...",
          variant: "destructive"
        })
      }
    })

    setChannel(roomChannel)

    return roomChannel
  }, [room, players, code, addToast])

  // Initialize
  useEffect(() => {
    if (!isValidRoomCode(code)) {
      setError('Ungültiger Raum-Code')
      setIsLoading(false)
      return
    }

    loadRoom()
  }, [code, loadRoom])

  // Setup realtime when room is loaded
  useEffect(() => {
    if (room && !channel) {
      setupRealtime()
    }
  }, [room, channel, setupRealtime])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channel) {
        channel.untrack()
        channel.unsubscribe()
      }
    }
  }, [channel])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      addToast({
        title: "Code kopiert!",
        description: "Der Raum-Code wurde in die Zwischenablage kopiert",
      })
    } catch (err) {
      addToast({
        title: "Fehler",
        description: "Code konnte nicht kopiert werden",
        variant: "destructive"
      })
    }
  }

  const handleWave = async () => {
    if (!channel || !currentPlayer) return

    try {
      await channel.send({
        type: 'broadcast',
        event: 'wave',
        payload: {
          type: 'wave',
          from: currentPlayer.name,
        } as WaveBroadcast
      })

      addToast({
        title: "👋 Wave gesendet!",
        description: "Du hast allen zugewunken!",
      })
    } catch (err) {
      addToast({
        title: "Fehler",
        description: "Wave konnte nicht gesendet werden",
        variant: "destructive"
      })
    }
  }

  const handleLeaveRoom = async () => {
    if (!currentPlayer) return

    try {
      // Leave via API
      await fetch(`/api/rooms/${code}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: currentPlayer.id })
      })

      // Untrack presence
      if (channel) {
        await channel.untrack()
        channel.unsubscribe()
      }

      // Navigate back
      router.push('/')
    } catch (err) {
      addToast({
        title: "Fehler",
        description: "Raum konnte nicht verlassen werden",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Raum...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Fehler</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Raum nicht gefunden</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    )
  }

  const presencePlayers = Object.values(presenceState).flat()
  const isCurrentPlayerHost = currentPlayer && presencePlayers.some(p => p.player_id === currentPlayer.id && p.is_host)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Verbunden' : 'Getrennt'}
            </span>
          </div>
        </div>

        {/* Room Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Raum: {code}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleCopyCode}>
                <Copy className="h-4 w-4 mr-2" />
                Code kopieren
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Status: {room.status === 'open' ? 'Offen' : 'Geschlossen'}
              </span>
              <span className="text-sm text-muted-foreground">
                Spieler: {presencePlayers.length}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Teilnehmer ({presencePlayers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {presencePlayers.map((player) => (
                <div
                  key={player.player_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                      {player.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{player.display_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {player.is_host && (
                      <Badge variant="default" className="text-xs">
                        Host
                      </Badge>
                    )}
                    {player.player_id === currentPlayer?.id && (
                      <Badge variant="outline" className="text-xs">
                        Du
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {presencePlayers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Keine Spieler online
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            onClick={() => router.push(`/room/${code}/quiz`)}
            disabled={!isConnected}
            variant="default"
            size="lg"
          >
            🎯 Quiz starten
          </Button>
          
          <Button
            onClick={handleWave}
            disabled={!isConnected || !currentPlayer}
            variant="outline"
            size="lg"
          >
            <Hand className="h-5 w-5 mr-2" />
            👋 Wave
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleLeaveRoom}
            size="lg"
          >
            Raum verlassen
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function RoomPage() {
  const params = useParams()
  const code = params.code as string

  return (
    <ToastContextProvider>
      <RoomPageContent code={code} />
    </ToastContextProvider>
  )
}
