# Custom Content Generator — Educational Materials

## What I built
- A React-based front-end UI to generate lesson plans, study guides, worksheets, slide outlines.

## Platform / Tools
- Vite + React
- Axios for API calls
- Any generative AI API (configurable via VITE_API_URL/VITE_API_KEY)

## Tech Stack & Integrations
- Frontend: React (Vite)
- API: External generative AI endpoint (OpenAI-compatible or custom)
- Export: Client-side text file export

## Why these technologies
- Vite + React: fast dev iteration and familiar frontend tooling
- Axios: simple HTTP client

## Challenges
- No API key in the environment — implemented a mocked response path for demo
- Input validation and content filtering implemented client-side

## Demo
- Run: npm install; npm run dev
- Configure env: VITE_API_URL and VITE_API_KEY for real API

## Next steps
- Add authentication, persistent saves, code/image generation, TTS/voice
