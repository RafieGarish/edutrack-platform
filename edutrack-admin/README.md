# Aniq UI — Admin Dashboard

A responsive admin dashboard built with **Next.js 15**, **Tailwind CSS**, **Radix UI**, and **Recharts**.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Features

- 🌑 Dark theme with emerald green accents
- 📱 Fully responsive (mobile sidebar drawer + desktop sidebar)
- 🕐 Live clock in greeting card
- 📅 Interactive mini calendar with event dots
- ✅ Functional quick tasks (add, toggle, tab)
- 📊 Charts: Donut, Area, Bar, Radar (Recharts)
- 🗺️ Animated world activity map (SVG)
- 🚀 Smooth animations & micro-interactions

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 15.1 | Framework (App Router) |
| Tailwind CSS | 3.4 | Styling |
| Radix UI | latest | Accessible primitives |
| Recharts | 2.15 | Charts |
| Lucide React | 0.469 | Icons |
| Outfit / Sora / JetBrains Mono | Google Fonts | Typography |

## Project Structure

```
app/
  layout.tsx             — Root layout with fonts
  page.tsx               — Redirects to /dashboard
  globals.css            — CSS variables + base styles
  dashboard/
    layout.tsx           — Sidebar + Header shell
    page.tsx             — Main dashboard page

components/dashboard/
  sidebar.tsx            — Collapsible sidebar navigation
  header.tsx             — Top header + PageHeader
  greeting-card.tsx      — Live clock + weather card
  stats-cards.tsx        — 4 KPI stat cards
  quick-tasks.tsx        — Task manager (add/toggle/tabs)
  calendar-widget.tsx    — Interactive month calendar
  recent-projects.tsx    — Project table with pagination
  activity-map.tsx       — SVG world map with activity dots
  insights.tsx           — Triple donut chart
  revenue-analytics.tsx  — Area chart + revenue stats
  performance-metrics.tsx — Bar chart by month
  performance-analytics.tsx — Radar chart + AI tip
```

## Customization

### Colors
Edit CSS variables in `app/globals.css`:
```css
--primary: 152 76% 45%;   /* emerald green */
--background: 220 16% 7%; /* near-black */
--card: 220 14% 10%;      /* dark card */
```

### Adding Pages
Add placeholder pages for sidebar links:
```bash
mkdir -p app/dashboard/projects
echo 'export default function Page() { return <div>Projects</div> }' > app/dashboard/projects/page.tsx
```
