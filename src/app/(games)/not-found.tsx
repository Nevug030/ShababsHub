import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, GamepadIcon } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <GamepadIcon className="h-24 w-24 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-4xl font-bold mb-2">Spiel nicht gefunden</h1>
          <p className="text-xl text-muted-foreground">
            Das gesuchte Spiel existiert nicht oder ist noch nicht verfügbar.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ups! Hier ist nichts zu finden</CardTitle>
            <CardDescription>
              Vielleicht hast du dich vertippt oder das Spiel ist noch in Entwicklung?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Keine Sorge! Wir haben viele andere tolle Spiele für dich.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zurück zur Startseite
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
