"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/browser"
import { Badge } from "@/components/ui/badge"

export function SupabaseHealth() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkConnection() {
      try {
        // Check if supabase client is available
        if (!supabase) {
          setIsConnected(false)
          setIsLoading(false)
          return
        }

        // Simple health check - try to get the current session
        // This doesn't require any tables to exist
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('Supabase connection check failed:', error.message)
          setIsConnected(false)
        } else {
          // If we can get session data (even if null), connection is working
          setIsConnected(true)
        }
      } catch (error) {
        console.warn('Supabase connection error:', error)
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    // Only run in development mode
    if (process.env.NODE_ENV === 'development') {
      checkConnection()
    } else {
      setIsLoading(false)
    }
  }, [])

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  if (isLoading) {
    return (
      <Badge variant="outline" className="text-xs">
        Supabase: checking...
      </Badge>
    )
  }

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className="text-xs"
    >
      Supabase: {isConnected ? "connected" : "disconnected"}
    </Badge>
  )
}
