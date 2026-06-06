# ⚡ Zexus — Network Intelligence Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js" />
  <img src="https://img.shields.io/badge/Framer_Motion-animated-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Cloudflare-Speed_API-orange?style=for-the-badge&logo=cloudflare" />
</div>

<br />

> A premium, cinematic 3D internet speed testing platform. Apple-level smoothness. Awwwards-worthy design.

## ✨ Features

- 🌐 **Rotating 3D Network Globe** — custom GLSL shaders, mouse parallax, animated data streams
- ⚡ **Real Speed Testing** — Cloudflare Speed Test API for accurate download/upload/ping/jitter
- 🎬 **Cinematic Transitions** — GSAP-powered scene changes between hero → test → results
- 📊 **3D Results Visualization** — animated bar charts, orbit rings, and particle bursts
- 🧲 **Magnetic Interactions** — every button tilts in 3D with spring physics
- 🎵 **Ambient Audio** — procedural Web Audio API drone sound (toggle on/off)
- 💎 **Glass Morphism UI** — floating panels, soft shadows, matte depth
- 🖱️ **Custom Cursor** — lagging magnetic ring cursor

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | Framework |
| React Three Fiber | 3D WebGL rendering |
| Three.js | 3D engine |
| Framer Motion | UI animations |
| GSAP | Cinematic transitions |
| Lenis | Smooth inertia scrolling |
| Tailwind CSS | Styling |
| Cloudflare Speed API | Real speed measurements |
| Web Audio API | Procedural ambient sound |

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/zexus.git
cd zexus

# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/zexus)

Or via CLI:
```bash
npm run build
vercel --prod
```

## 🎨 Design Philosophy

- **No cyberpunk aesthetics** — matte black, graphite, silver palette
- **Apple-level smoothness** — 60fps target, optimized WebGL
- **Luxury minimal** — every pixel intentional
- **Emotional motion** — animations tell a story, not just move things

## 📁 Project Structure

```
zexus/
├── app/                    # Next.js App Router
├── components/
│   ├── canvas/             # Three.js / R3F scenes
│   ├── ui/                 # React components
│   ├── layout/             # Navbar, Audio toggle
│   ├── effects/            # Cinematic transitions
│   └── providers/          # Lenis smooth scroll
├── hooks/                  # Custom hooks (speed test, cursor, parallax)
└── public/                 # Static assets
```

## 📄 License

MIT — built with ❤️ by Zexus
