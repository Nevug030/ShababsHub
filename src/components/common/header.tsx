"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { GamepadIcon, Plus, LogIn, Loader2 } from "lucide-react"
import { useState } from "react"
import { getOrCreatePlayer } from "@/lib/storage"
import { isValidDisplayName, isValidRoomCode } from "@/lib/id"
import type { CreateRoomResponse } from "@/types/rooms"

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
}

function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidDisplayName(displayName)) {
      setError('Name muss zwischen 2 und 20 Zeichen lang sein')
      return
    }

    setIsLoading(true)

    try {
      const player = getOrCreatePlayer(displayName.trim())
      
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          player_id: player.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create room')
      }

      const data: CreateRoomResponse = await response.json()
      
      // Navigate to room
      router.push(`/room/${data.code}`)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-card p-6 rounded-lg shadow-lg max-w-sm mx-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Raum erstellen</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-sm font-medium mb-2">
              Dein Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Gib deinen Namen ein"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive mb-4">{error}</p>
          )}
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !displayName.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Erstelle...
                </>
              ) : (
                'Erstellen'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface JoinRoomModalProps {
  isOpen: boolean
  onClose: () => void
}

function JoinRoomModal({ isOpen, onClose }: JoinRoomModalProps) {
  const [displayName, setDisplayName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isValidDisplayName(displayName)) {
      setError('Name muss zwischen 2 und 20 Zeichen lang sein')
      return
    }

    if (!isValidRoomCode(roomCode)) {
      setError('Ungültiger Raum-Code (6 Zeichen)')
      return
    }

    setIsLoading(true)

    try {
      const player = getOrCreatePlayer(displayName.trim())
      const code = roomCode.toUpperCase()
      
      // First check if room exists
      const checkResponse = await fetch(`/api/rooms/${code}`)
      if (!checkResponse.ok) {
        const errorData = await checkResponse.json()
        throw new Error(errorData.error || 'Room not found')
      }

      // Join the room
      const joinResponse = await fetch(`/api/rooms/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName.trim(),
          player_id: player.id
        })
      })

      if (!joinResponse.ok) {
        const errorData = await joinResponse.json()
        throw new Error(errorData.error || 'Failed to join room')
      }

      // Navigate to room
      router.push(`/room/${code}`)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-card p-6 rounded-lg shadow-lg max-w-sm mx-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Raum beitreten</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="joinDisplayName" className="block text-sm font-medium mb-2">
              Dein Name
            </label>
            <input
              id="joinDisplayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Gib deinen Namen ein"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="roomCode" className="block text-sm font-medium mb-2">
              Raum-Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="A1B2C3"
              maxLength={6}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground font-mono text-center text-lg tracking-wider"
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive mb-4">{error}</p>
          )}
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !displayName.trim() || !roomCode.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Beitrete...
                </>
              ) : (
                'Beitreten'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function Header() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            aria-label="Zur Startseite"
          >
            <GamepadIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Party Games</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="hidden sm:flex"
              aria-label="Raum erstellen"
            >
              <Plus className="h-4 w-4 mr-2" />
              Raum erstellen
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowJoinModal(true)}
              className="hidden sm:flex"
              aria-label="Raum beitreten"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Raum beitreten
            </Button>

            {/* Mobile buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="sm:hidden"
              aria-label="Raum erstellen"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowJoinModal(true)}
              className="sm:hidden"
              aria-label="Raum beitreten"
            >
              <LogIn className="h-4 w-4" />
            </Button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </>
  )
}
