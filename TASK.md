# BUILD TASK: runbycode.de — Vollständige statische Website

## Deine Rolle
Du bist Weltklasse-Designer + Weltklasse-Copywriter + SEO-Experte.
Baue die komplette neue Website für runbycode.de als statisches HTML.
Qualitätsstandard: besser als alle Wettbewerber (wp-munich.de, max2-consulting.de, tzn-digital.com).

## Über den Kunden
- **Name:** RunByCode
- **Was:** WordPress & WooCommerce Agentur München
- **Tel:** +49 89 3288 6771 | **E-Mail:** kontakt@runbycode.de
- **Kernpositionierung:** "Programmierer, nicht Agentur" — direkter Kontakt, kein Ticketsystem
- **USP #1:** "In 95% der Fälle können wir bestehende Seiten übernehmen — kein Relaunch nötig"
- **Antwortversprechen:** Innerhalb von 24 Stunden
- **Zielgruppe:** Unternehmen die WordPress/WooCommerce betreiben + technische Hilfe brauchen

## SEO-Strategie (PFLICHT, nicht optional)

| Seite | Primär-Keyword | Vol/Mo | Diff |
|-------|---------------|--------|------|
| index.html | WordPress Agentur München | 320 | 44 |
| wordpress-agentur-muenchen/index.html | WordPress Agentur München | 320 | 44 |
| woocommerce-agentur-muenchen/index.html | WooCommerce Agentur München | 30 | ~0 |
| wordpress-wartung/index.html | WordPress Wartung München | 10 | ~0 |
| woocommerce-entwicklung/index.html | WooCommerce Shop erstellen lassen | 110 | mittel |
| wordpress-betreuung/index.html | WordPress Website Betreuung | 110 | niedrig |
| projekte/index.html | (Social Proof, kein KW-Fokus) | — | — |
| kontakt/index.html | (Conversion, kein KW-Fokus) | — | — |

**SEO-Pflicht auf jeder Seite:**
- <title>[Primär-Keyword] | München | RunByCode</title>
- <meta name="description"> ~155 Zeichen mit Keyword + CTA
- Exakt ein <h1> mit dem Primär-Keyword
- Mindestens 1.200 Wörter (Wettbewerber haben 1.200-2.000)
- <link rel="canonical"> pro Seite
- JSON-LD Schema: LocalBusiness + Organization auf jeder Seite

## Design-Vorgaben
- **Stil:** Tech-Clean, modern, kein Corporate-Bullshit — Energie und Kompetenz ausstrahlen
- **Farben:** Dunkles Anthrazit (#1a1a2e oder ähnlich) als Basis + kräftiges Orange (#ff6b35) oder Electric Blue als Akzentfarbe
- **Fonts:** Google Fonts — Inter oder DM Sans (via @import)
- **Bilder:** SVG-Platzhalter (selbst als inline SVG mit sinnvollen Farben) — KEIN <img src="placeholder.png">
- **Logo:** Text-Logo "RunByCode" in Akzentfarbe
- **Ton:** Direkt, kompetent, ohne Agentur-Bullshit-Sprache

## Seitenstruktur (alle 8 Seiten erstellen)
```
build/
├── index.html
├── wordpress-agentur-muenchen/
│   └── index.html
├── woocommerce-agentur-muenchen/
│   └── index.html
├── wordpress-wartung/
│   └── index.html
├── woocommerce-entwicklung/
│   └── index.html
├── wordpress-betreuung/
│   └── index.html
├── projekte/
│   └── index.html
└── kontakt/
    └── index.html
```

## Navigation (jede Seite)
- Logo "RunByCode" links (verlinkt auf /)
- Nav: Leistungen (Dropdown mit den 5 Service-Pages), Projekte, Kontakt
- CTA-Button rechts: "Anfrage stellen" → /kontakt/
- Sticky header, mobile-responsive (Hamburger-Menü)

## Content-Vorgaben pro Seite

### Homepage (index.html)
- Hero: starke Headline mit "WordPress & WooCommerce Agentur München", Subline mit USP "Programmierer, nicht Agentur"
- 2 CTAs: "Projekt besprechen" + "Leistungen entdecken"
- Leistungsübersicht (6 Kacheln: WP-Entwicklung, WooCommerce, Wartung, Betreuung, Optimierung, Support)
- "Warum RunByCode" Section mit 3-4 USPs
- Anti-Relaunch-Section: "95% Ihrer Seiten können wir übernehmen — ohne Relaunch"
- Testimonial-Platzhalter (3x, mit Name/Firma Platzhalter)
- Kontakt-CTA-Section
- Footer mit Adresse, Tel, E-Mail, Nav, Impressum/Datenschutz Links

### /wordpress-agentur-muenchen/
- H1: "WordPress Agentur München"
- Intro ~200 Wörter
- Services (WP-Individualentwicklung, Theme/Plugin-Entwicklung, WP-Migration, Relaunch)
- Prozess (3-4 Schritte)
- Vorteile vs. klassische Agenturen
- FAQ (5 Fragen)
- CTA

### /woocommerce-agentur-muenchen/ ⚡ QUICK WIN
- H1: "WooCommerce Agentur München"
- WooCommerce-Spezialisierung herausstellen
- Services: Shop-Aufbau, Custom-Entwicklung, Payment-Integration, Performance
- Warum WooCommerce? (vs. Shopify etc.)
- FAQ (5 Fragen)
- CTA

### /wordpress-wartung/ ⚡ QUICK WIN #1
- H1: "WordPress Wartung München"
- Wartungspakete (3 Pakete: Basic, Professional, Premium) mit Preisrahmen (optional)
- Was ist enthalten: Updates, Backups, Security, Monitoring
- Warum Wartung wichtig ist (Probleme ohne Wartung)
- FAQ (5 Fragen)
- CTA: "Wartungspaket anfragen"

### /woocommerce-entwicklung/
- H1: "WooCommerce Shop erstellen lassen"
- Custom WooCommerce Development
- Payment-Integration (Stripe, PayPal, SEPA etc.)
- Shop-Performance, Conversion-Optimierung
- FAQ
- CTA

### /wordpress-betreuung/
- H1: "WordPress Betreuung & Support"
- Laufende Betreuung, Notfall-Support, Hosting-Beratung
- Reaktionszeiten-Versprechen: 24h Antwort
- FAQ
- CTA

### /projekte/
- H1: "Unsere Projekte"
- 4-6 Projekt-Karten (Platzhalter: Name, Branche, Was gemacht wurde, Ergebnis)
- Keine echten Projekte nötig — glaubwürdige Platzhalter
- Kundenstimmen (3x Platzhalter)
- CTA

### /kontakt/
- H1: "Kontakt aufnehmen"
- Kontaktformular (Name, E-Mail, Telefon, Nachricht, Datenschutz-Checkbox)
- Antwortversprechen: "Wir melden uns innerhalb von 24 Stunden"
- Kontaktdaten: Tel +49 89 3288 6771, E-Mail kontakt@runbycode.de, München
- Kein Formular-Backend nötig — Formular mit action="mailto:..." oder als Platzhalter

## Technische Anforderungen
- Alles in einer einzigen HTML-Datei pro Seite (CSS eingebettet in <style>)
- KEIN externes CSS (außer Google Fonts via @import)
- JavaScript nur für Navigation/Hamburger-Menü (inline in <script>)
- Mobile-responsive (CSS Grid/Flexbox)
- Keine JS-Frameworks, kein jQuery
- Schnell ladend: SVG statt Bilder wo möglich

## Qualitäts-Check (bevor du fertig bist)
- [ ] Alle 8 Seiten vorhanden
- [ ] Jede Seite: korrekter <title>, <meta description>, <h1>
- [ ] Jede Seite: JSON-LD Schema
- [ ] Jede Seite: Canonical Link
- [ ] Navigation identisch auf allen Seiten
- [ ] Mobile-Responsive
- [ ] Mindestens 1.200 Wörter Content pro Service-Page
- [ ] Kein KI-Generik-Sprache (kein "maßgeschneidert", "ganzheitlich", "Synergien")
- [ ] CTAs konkret und stark

## Wenn du fertig bist
1. Führe `git add -A && git commit -m "[runbycode] Initial build — alle 8 Seiten"` aus
2. Gib eine kurze Zusammenfassung was gebaut wurde
3. Führe aus: `openclaw system event --text "Done: runbycode.de Website-Build fertig — alle 8 HTML-Seiten erstellt, git committed. Reviewer kann beginnen." --mode now`
