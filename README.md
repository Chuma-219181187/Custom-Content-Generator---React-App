# Custom Content Generator — Educational Materials

This is a React (Vite) frontend scaffold for an Educational Materials AI content generator.

Local run (after installing Node.js and npm):

1. Install dependencies

```powershell
npm install
```

2. Start dev server

```powershell
npm run dev
```

3. To use a real generative API, set environment variables (create a `.env` file in project root):

```
VITE_API_URL=https://your-api-endpoint.example/v1/generate
VITE_API_KEY=your_secret_key
```

Notes:
- The app includes mocked responses when no API key is provided so you can demo the UI without a key.
- Export to .txt is supported from the UI.

