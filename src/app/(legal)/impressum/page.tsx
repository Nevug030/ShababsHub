import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Impressum - Party Games",
  description: "Impressum und rechtliche Informationen zu Party Games",
}

export default function ImpressumPage() {
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
              <CardTitle className="text-3xl">Impressum</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-6">
                Diese Seite befindet sich noch im Aufbau. Hier werden bald alle rechtlichen Informationen verfügbar sein.
              </p>
              
              <h2>Angaben gemäß § 5 TMG</h2>
              <p>
                [Ihr Name/Firmenname]<br />
                [Ihre Adresse]<br />
                [PLZ Ort]
              </p>

              <h2>Kontakt</h2>
              <p>
                E-Mail: [Ihre E-Mail]<br />
                Telefon: [Ihre Telefonnummer]
              </p>

              <h2>Haftungsausschluss</h2>
              <p>
                Die Inhalte dieser Seite werden mit größter Sorgfalt erstellt. 
                Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte 
                können wir jedoch keine Gewähr übernehmen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
