# ShababsHub - Party Spiele Plattform

Eine moderne, produktions-bereite Next.js-Anwendung für Party-Spiele mit schöner Benutzeroberfläche und umfassendem Tooling-Setup.

## 🚀 Features

- **Next.js 14** mit App Router und TypeScript
- **TailwindCSS** für Styling mit **shadcn/ui** Komponenten
- **Dark/Light Mode** Unterstützung mit next-themes
- **Live-Räume** - Erstelle und trete Räumen bei mit eindeutigen Codes
- **Realtime-Presence** - Sieh wer online ist in Echtzeit
- **Broadcasting** - Sende Waves und Nachrichten an alle Teilnehmer
- **Quiz MVP** - Live-Quiz mit 10 Fragen, Timer und Scoreboard
- **Supabase Realtime** für Live-Kommunikation
- **Lucide React** Icons
- **Pfad-Aliase** für saubere Imports
- **Unit Tests** mit Vitest und Testing Library
- **ESLint & Prettier** für Code-Qualität
- **Produktions-bereite** Konfiguration

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Sprache:** TypeScript
- **Datenbank:** Supabase (PostgreSQL)
- **Styling:** TailwindCSS + shadcn/ui
- **Icons:** Lucide React
- **Theme:** next-themes
- **Testing:** Vitest + Testing Library
- **Code-Qualität:** ESLint + Prettier
- **Package Manager:** npm/pnpm

## 🛠️ Lokale Entwicklung

### Voraussetzungen

- Node.js 18+ 
- npm oder pnpm

### Setup

1. **Repository klonen und Dependencies installieren:**
   ```bash
   git clone <repository-url>
   cd ShababsHub
   npm install
   # oder
   pnpm install
   ```

2. **Supabase einrichten:**
   
   **Supabase Projekt erstellen:**
   - Gehe zu [supabase.com](https://supabase.com)
   - Erstelle ein neues Projekt
   - Notiere dir die Project URL und anon key

   **Umgebungsvariablen konfigurieren:**
   Erstelle eine `.env.local` Datei im Hauptverzeichnis:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   
   > **Tipp:** Kopiere `env.local.example` zu `.env.local` und fülle die Werte aus.

3. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   # oder
   pnpm dev
   ```

4. **Browser öffnen:**
   Besuche [http://localhost:3000](http://localhost:3000)
   
   > **Dev-Modus:** Im Development-Modus siehst du im Footer einen "Supabase: connected/disconnected" Badge, der den Verbindungsstatus anzeigt.

## 🏠 Rooms MVP

Das Rooms-System ermöglicht es Benutzern, Live-Räume zu erstellen und beizutreten:

### Features
- **Room-Erstellung**: Generiere eindeutige 6-stellige Codes (A-Z, 2-9, ohne verwirrende Zeichen)
- **Room-Beitritt**: Tritt Räumen mit Code bei
- **Live-Presence**: Sieh alle Teilnehmer in Echtzeit
- **Broadcasting**: Sende "Wave 👋" an alle Teilnehmer
- **Persistenz**: Name und Player-ID bleiben nach Refresh erhalten
- **Error-Handling**: Benutzerfreundliche Fehlermeldungen
- **Mobile-optimiert**: Responsive Design für alle Geräte

### Verwendung
1. **Raum erstellen**: Klicke "Raum erstellen", gib deinen Namen ein
2. **Raum beitreten**: Klicke "Raum beitreten", gib Namen + Code ein
3. **Interagieren**: Sende Waves, sieh Live-Teilnehmerliste
4. **Verlassen**: "Raum verlassen" Button oder Browser schließen

### Technische Details
- **Supabase Realtime**: Live-Presence und Broadcasting
- **PostgreSQL**: Rooms und Players Tabellen
- **Row Level Security**: Basis-Policies für MVP
- **LocalStorage**: Persistente Player-IDs und Namen
- **TypeScript**: Vollständige Type-Sicherheit

## 🎯 Quiz MVP

Das Quiz-System bietet ein vollständiges Live-Quiz-Erlebnis:

### Features
- **10 Demo-Fragen**: Aus verschiedenen Kategorien (Geographie, Geschichte, Wissenschaft, etc.)
- **Timer-System**: 20 Sekunden pro Frage mit Live-Countdown
- **Live-Scoreboard**: Top 5 Spieler + persönlicher Rang
- **Realtime-Updates**: Alle Teilnehmer sehen Fragen und Antworten synchron
- **Multiple Choice**: 4 Antwortmöglichkeiten (A-D) pro Frage
- **Sofortige Auflösung**: Richtige Antwort wird nach Timer-Ablauf gezeigt
- **Punkt-System**: 1 Punkt pro richtige Antwort
- **Host-Kontrolle**: Host startet Quiz und steuert Runden

### Verwendung
1. **Quiz starten**: Im Raum auf "🎯 Quiz starten" klicken
2. **Fragen beantworten**: Innerhalb von 20 Sekunden eine Antwort wählen
3. **Auflösung ansehen**: Richtige Antwort wird automatisch gezeigt
4. **Scoreboard verfolgen**: Live-Punkte aller Teilnehmer
5. **10 Runden**: Automatischer Übergang zwischen Fragen

### Architektur
- **Datenbank**: Quiz-Sessions, Runden und Antworten in PostgreSQL
- **API-Routes**: RESTful Endpoints für Session-Management
- **Client-State**: React State für UI und Timer-Management
- **Fragen-Pool**: Statische Demo-Fragen mit Kategorien und Schwierigkeiten
- **Scoring**: Client-seitige Berechnung mit Server-Persistierung

### Verfügbare Scripts

- `npm run dev` - Entwicklungsserver starten
- `npm run build` - Für Produktion bauen
- `npm run start` - Produktionsserver starten
- `npm run lint` - ESLint ausführen
- `npm run test` - Tests ausführen
- `npm run test:watch` - Tests im Watch-Modus
- `npm run test:ui` - Tests mit UI ausführen

## 🧪 Testing

Das Projekt enthält ein umfassendes Test-Setup mit Vitest und Testing Library:

```bash
# Alle Tests ausführen
npm run test

# Tests im Watch-Modus
npm run test:watch

# Tests mit UI
npm run test:ui
```

Tests befinden sich im `src/test/` Verzeichnis und können neben Komponenten mit der `.test.tsx` oder `.spec.tsx` Namenskonvention platziert werden.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   │   └── button.tsx
│   ├── common/           # Shared components
│   │   └── theme-toggle.tsx
│   └── theme-provider.tsx
├── lib/                  # Utility functions
│   └── utils.ts          # cn helper and utilities
├── types/                # TypeScript type definitions
└── test/                 # Test setup and utilities
    ├── setup.ts          # Test configuration
    └── example.test.tsx  # Example tests
```

## 🎨 Styling & Components

### TailwindCSS
The project uses TailwindCSS with a custom configuration that includes CSS variables for theming. The configuration supports both light and dark modes.

### shadcn/ui Components
Pre-built, accessible components are available in `src/components/ui/`. To add new components:

```bash
# If using shadcn/ui CLI (recommended for production)
npx shadcn-ui@latest add <component-name>
```

### Path Aliases
Clean imports are enabled via TypeScript path aliases:

```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { User } from "@/types/user"
```

## 🌙 Theme Support

The application supports automatic dark/light mode switching:

- System preference detection
- Manual theme toggle
- Persistent theme selection
- CSS variables for consistent theming

## 🚢 Deployment

### Firebase Hosting (Empfohlen)

Das Projekt ist für Firebase Hosting mit automatischen GitHub Actions konfiguriert.

#### Erstmaliges Setup

1. **Firebase CLI installieren:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Bei Firebase anmelden:**
   ```bash
   firebase login
   ```

3. **Firebase Projekt erstellen:**
   ```bash
   firebase projects:create shababshub-party-games
   ```

4. **Hosting aktivieren:**
   ```bash
   firebase init hosting
   # Wähle das erstellte Projekt aus
   # Public directory: out
   # Single-page app: No
   # GitHub integration: Yes (optional)
   ```

#### Lokales Deployment

```bash
# Build erstellen
npm run build

# Lokal testen (optional)
firebase serve

# Zu Firebase deployen
firebase deploy
```

#### Automatisches Deployment via GitHub Actions

Das Repository ist bereits für automatische Deployments konfiguriert:

**Einrichtung:**
1. Gehe zu deinem Firebase Projekt → Projekteinstellungen → Service Accounts
2. Generiere einen neuen Private Key (JSON)
3. Füge den Inhalt als GitHub Secret hinzu: `FIREBASE_SERVICE_ACCOUNT_SHABABSHUB_PARTY_GAMES`

**Workflow:**
- **Pull Requests:** Erstellen Preview-Deployments
- **Main Branch:** Automatisches Deployment zur Produktion
- **Tests:** Linting und Tests laufen vor jedem Deployment

#### Vercel (Alternative)
```bash
# Vercel CLI installieren
npm i -g vercel

# Deployen
vercel --prod
```

### Umgebungsvariablen für Produktion

Aktuell werden keine Server-seitigen Umgebungsvariablen benötigt, da die App statisch exportiert wird.

Für zukünftige Features:
```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
# Weitere öffentliche Variablen hier hinzufügen
```

## 🔧 Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - TailwindCSS configuration
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Test configuration
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `postcss.config.js` - PostCSS configuration

## 📝 Code Quality

The project enforces code quality through:

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Git hooks** (can be added with husky)
- **Path aliases** for clean imports

## 🛠️ Troubleshooting

### Häufige Deployment-Probleme

**Build schlägt fehl:**
```bash
# .next Verzeichnis löschen und neu builden
rm -rf .next
npm run build
```

**Windows EPERM Fehler:**
```bash
# Alle Node-Prozesse beenden
taskkill /f /im node.exe
# Dann .next löschen und neu builden
```

**Firebase Deployment Fehler:**
```bash
# Firebase CLI neu installieren
npm uninstall -g firebase-tools
npm install -g firebase-tools
firebase login
```

**GitHub Actions schlagen fehl:**
- Überprüfe ob das Firebase Service Account Secret korrekt gesetzt ist
- Stelle sicher, dass das Firebase Projekt existiert
- Überprüfe die Projekt-ID in `.firebaserc`

### Development-Probleme

**Seite lädt nicht:**
- Überprüfe ob der Dev-Server auf dem richtigen Port läuft
- Lösche `.next` und starte neu: `npm run dev`

**Styling-Probleme:**
- Überprüfe TailwindCSS Konfiguration
- Hard-Refresh im Browser (Ctrl+F5)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Vitest Documentation](https://vitest.dev)
- [Lucide Icons](https://lucide.dev)

---

Built with ❤️ using Next.js and modern web technologies.
