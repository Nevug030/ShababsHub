import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, MessageSquare } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kontakt - Party Games",
  description: "Kontaktieren Sie uns bei Fragen zu Party Games",
}

export default function KontaktPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" asChild className="mb-8">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Startseite
            </Link>
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Kontakt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Haben Sie Fragen, Anregungen oder Feedback? Wir freuen uns auf Ihre Nachricht!
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">E-Mail</h3>
                      <p className="text-muted-foreground">kontakt@party-games.de</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Feedback</h3>
                      <p className="text-muted-foreground">Wir freuen uns über Ihr Feedback!</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Häufige Fragen</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Wie kann ich ein neues Spiel vorschlagen?</li>
                    <li>• Wann werden neue Spiele hinzugefügt?</li>
                    <li>• Gibt es eine mobile App?</li>
                    <li>• Wie funktionieren die Multiplayer-Spiele?</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Hinweis:</strong> Diese Kontaktseite ist ein Platzhalter. 
                  In der finalen Version würde hier ein funktionierendes Kontaktformular 
                  oder echte Kontaktdaten stehen.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
