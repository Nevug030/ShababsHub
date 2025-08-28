import Link from "next/link"
import { Github } from "lucide-react"
import { SupabaseHealth } from "./supabase-health"

export function Footer() {
  return (
    <footer className="border-t bg-card/50 py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link 
              href="/impressum" 
              className="hover:text-foreground transition-colors"
              aria-label="Impressum"
            >
              Impressum
            </Link>
            <Link 
              href="/datenschutz" 
              className="hover:text-foreground transition-colors"
              aria-label="Datenschutz"
            >
              Datenschutz
            </Link>
            <Link 
              href="/kontakt" 
              className="hover:text-foreground transition-colors"
              aria-label="Kontakt"
            >
              Kontakt
            </Link>
          </div>

          {/* Copyright, GitHub & Dev Status */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 Party Games</span>
            <SupabaseHealth />
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub Repository öffnen"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
