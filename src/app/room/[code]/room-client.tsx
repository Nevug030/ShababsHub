"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
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

interface RoomClientProps {
  code: string
}

function RoomPageContent({ code }: RoomClientProps) {
  const router = useRouter()
  const { addToast } = useToast()
  
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<RoomPlayer[]>([])
  const [presence, setPresence] = useState<Record<string, PresenceState>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<{ id: string; name: string } | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isWaving, setIsWaving] = useState(false)

  // Validate room code early but don't return yet
  const isValidCode = isValidRoomCode(code)

  // Load room data
  const loadRoom = useCallback(async () => {
    if (!code || !isValidCode) return

    try {
      const response = await fetch(`/api/rooms/${code}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load room')
      }

      setRoom(data.room)
      setPlayers(data.players || [])
      setError(null)
    } catch (err) {
      console.error('Failed to load room:', err)
      setError(err instanceof Error ? err.message : 'Failed to load room')
    } finally {
      setIsLoading(false)
    }
  }, [code, isValidCode])

  // Join room
  const joinRoom = useCallback(async (player: { id: string; name: string }) => {
    try {
      const response = await fetch(`/api/rooms/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          display_name: player.name,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to join room')
      }

      // Reload room data after joining
      await loadRoom()
    } catch (err) {
      console.error('Failed to join room:', err)
      addToast({
        title: "Fehler",
        description: err instanceof Error ? err.message : 'Failed to join room',
        variant: "destructive",
      })
    }
  }, [code, loadRoom, addToast])

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (!currentPlayer) return

    try {
      const response = await fetch(`/api/rooms/${code}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: currentPlayer.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to leave room')
      }

      // Redirect to home
      router.push('/')
    } catch (err) {
      console.error('Failed to leave room:', err)
      addToast({
        title: "Fehler",
        description: err instanceof Error ? err.message : 'Failed to leave room',
        variant: "destructive",
      })
    }
  }, [currentPlayer, code, router, addToast])

  // Send wave
  const sendWave = useCallback(async () => {
    if (!channel || !currentPlayer || isWaving) return

    setIsWaving(true)
    try {
      const waveEvent: WaveBroadcast = {
        type: 'wave',
        from: currentPlayer.name,
        timestamp: new Date().toISOString(),
      }

      await channel.send({
        type: 'broadcast',
        event: 'wave',
        payload: waveEvent,
      })

      addToast({
        title: "👋 Gewunken!",
        description: `Du hast allen im Raum zugewunken.`,
      })
    } catch (err) {
      console.error('Failed to send wave:', err)
      addToast({
        title: "Fehler",
        description: "Konnte nicht winken.",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsWaving(false), 1000)
    }
  }, [channel, currentPlayer, isWaving, addToast])

  // Copy room code
  const copyRoomCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      addToast({
        title: "Kopiert!",
        description: `Raumcode &quot;${code}&quot; wurde in die Zwischenablage kopiert.`,
      })
    } catch (err) {
      console.error('Failed to copy room code:', err)
      addToast({
        title: "Fehler",
        description: "Konnte Raumcode nicht kopieren.",
        variant: "destructive",
      })
    }
  }, [code, addToast])

  // Initialize player and room
  useEffect(() => {
    const player = getOrCreatePlayer()
    setCurrentPlayer(player)
    loadRoom()
  }, [loadRoom])

  // Join room when player is ready
  useEffect(() => {
    if (currentPlayer && room && !players.find(p => p.player_id === currentPlayer.id)) {
      joinRoom(currentPlayer)
    }
  }, [currentPlayer, room, players, joinRoom])

  // Setup Supabase Realtime
  useEffect(() => {
    if (!supabase || !currentPlayer || !room) return

    const roomChannel = supabase.channel(`room-${code}`)

    // Track presence
    roomChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = roomChannel.presenceState() as Record<string, PresenceState[]>
        const transformedPresence: Record<string, PresenceState> = {}
        
        Object.entries(presenceState).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            transformedPresence[key] = presences[0]
          }
        })
        
        setPresence(transformedPresence)
      })
      .on('broadcast', { event: 'wave' }, (payload) => {
        const waveData = payload.payload as WaveBroadcast
        if (waveData.from !== currentPlayer.name) {
          addToast({
            title: `👋 ${waveData.from}`,
            description: `${waveData.from} winkt allen zu!`,
          })
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          
          // Track our presence
          await roomChannel.track({
            player_id: currentPlayer.id,
            display_name: currentPlayer.name,
            is_host: players.find(p => p.player_id === currentPlayer.id)?.is_host || false,
            online_at: new Date().toISOString(),
          })
        } else {
          setIsConnected(false)
        }
      })

    setChannel(roomChannel)

    return () => {
      roomChannel.unsubscribe()
    }
  }, [currentPlayer, room, players, code, addToast])

  // Early returns after all hooks
  if (!isValidCode) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Ungültiger Raumcode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Der Raumcode &quot;{code}&quot; ist ungültig.</p>
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Startseite
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Lade Raum...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Fehler</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{error}</p>
              <div className="flex gap-2">
                <Button onClick={() => router.push('/')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zur Startseite
                </Button>
                <Button variant="outline" onClick={loadRoom}>
                  Erneut versuchen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Raum nicht gefunden</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Der Raum mit dem Code &quot;{code}&quot; existiert nicht oder ist nicht mehr verfügbar.</p>
              <Button onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Startseite
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isHost = currentPlayer && players.find(p => p.player_id === currentPlayer.id)?.is_host
  const presenceList = Object.values(presence)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Startseite
          </Button>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Verbunden' : 'Getrennt'}
            </span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Room Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Raum {code}
                  {isHost && <Badge variant="secondary">Host</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Raumcode:</p>
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded text-lg font-mono">
                      {code}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyRoomCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={sendWave}
                    disabled={isWaving || !isConnected}
                    variant="outline"
                    size="sm"
                  >
                    {isWaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Winke...
                      </>
                    ) : (
                      <>
                        <Hand className="h-4 w-4 mr-2" />
                        👋 Winken
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => router.push(`/room/${code}/quiz`)}
                    disabled={!isHost}
                    size="sm"
                  >
                    🎯 Quiz starten
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Room Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Raumaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={leaveRoom}
                  variant="destructive"
                  size="lg"
                >
                  Raum verlassen
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Participants */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Teilnehmer ({presenceList.length + players.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Show presence (online players) */}
                  {presenceList.map((player) => (
                    <div key={player.player_id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="font-medium">{player.display_name}</span>
                      <div className="flex items-center gap-2">
                        {player.is_host && <Badge variant="secondary" className="text-xs">Host</Badge>}
                        <div className="h-2 w-2 rounded-full bg-green-500" title="Online" />
                      </div>
                    </div>
                  ))}

                  {/* Show offline players */}
                  {players
                    .filter(player => !presenceList.some(p => p.player_id === player.player_id))
                    .map((player) => (
                      <div key={player.player_id} className="flex items-center justify-between p-2 rounded bg-muted/20">
                        <span className="text-muted-foreground">{player.display_name}</span>
                        <div className="flex items-center gap-2">
                          {player.is_host && <Badge variant="outline" className="text-xs">Host</Badge>}
                          <div className="h-2 w-2 rounded-full bg-gray-400" title="Offline" />
                        </div>
                      </div>
                    ))
                  }

                  {presenceList.length === 0 && players.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Keine Teilnehmer im Raum
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RoomClient({ code }: RoomClientProps) {
  return (
    <ToastContextProvider>
      <RoomPageContent code={code} />
    </ToastContextProvider>
  )
}