import React, { useState } from 'react'
import axios from 'axios'

const PROMPT_TEMPLATES = [
  {
    id: 'lesson-plan',
    title: 'Lesson Plan (Full)',
    prompt: 'Create a detailed lesson plan for a {level} level class on {topic} lasting {duration} minutes. Include objectives, materials, activities, and assessment.'
  },
  {
    id: 'study-guide',
    title: 'Study Guide (Summary + Q&A)',
    prompt: 'Summarize key concepts for {topic} and produce 10 practice questions with answers suitable for {level} level students.'
  },
  {
    id: 'worksheet',
    title: 'Worksheet (Exercises)',
    prompt: 'Generate a worksheet with 8 exercises and answers on {topic} appropriate for {level} level.'
  },
  {
    id: 'slide-deck',
    title: 'Slide Deck Outline',
    prompt: 'Produce a slide-by-slide outline for a presentation on {topic} targeted at {level} students, include speaking notes.'
  },
  {
    id: 'lesson-summary',
    title: 'Lesson Summary (Quick)',
    prompt: 'Provide a concise summary of {topic} suitable for revision for {level} students in under {duration} minutes.'
  }
]

function validateInputs({ topic, level, duration }) {
  const errors = []
  if (!topic || topic.trim().length < 3) errors.push('Topic must be at least 3 characters.')
  if (!level) errors.push('Level is required.')
  if (duration && isNaN(Number(duration))) errors.push('Duration must be a number.')
  return errors
}

export default function App() {
  const [topic, setTopic] = useState('Photosynthesis')
  const [level, setLevel] = useState('High School')
  const [duration, setDuration] = useState('45')
  const [templateId, setTemplateId] = useState(PROMPT_TEMPLATES[0].id)
  const [customPrompt, setCustomPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState({ tokens: 0, timeMs: 0 })

  const currentTemplate = PROMPT_TEMPLATES.find(t => t.id === templateId)

  async function generate(e) {
    e.preventDefault()
    setError(null)
    const inputs = { topic, level, duration }
    const errors = validateInputs(inputs)
    if (errors.length) return setError(errors.join(' '))

    const promptText = customPrompt && customPrompt.trim().length > 0
      ? customPrompt
      : currentTemplate.prompt
          .replace('{topic}', topic)
          .replace('{level}', level)
          .replace('{duration}', duration)

    // Basic output filtering (remove disallowed words)
    const filter = (text) => {
      const banned = ['plagiarize', 'cheat']
      for (const w of banned) if (text.toLowerCase().includes(w)) return null
      return text
    }

    setLoading(true)
    const start = Date.now()
    try {
      // NOTE: Use your generative AI API key by setting REACT_APP_API_URL and REACT_APP_API_KEY in env when running.
      // This code demonstrates the request flow using axios but uses a mocked response if no env provided.
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const apiKey = import.meta.env.VITE_API_KEY || ''

      let responseText = ''
      if (!apiUrl || !apiKey) {
        // mocked response for local dev without API
        responseText = `-- MOCKED OUTPUT --\nPrompt used:\n${promptText}\n\nGenerated content: This is a sample educational content for ${topic} at ${level}.`
      } else {
        const resp = await axios.post(apiUrl, { prompt: promptText }, { headers: { Authorization: `Bearer ${apiKey}` } })
        responseText = resp.data?.text || JSON.stringify(resp.data)
      }

      const filtered = filter(responseText)
      if (!filtered) throw new Error('Output failed content filtering.')
      setOutput(filtered)
      setMeta({ tokens: Math.floor(Math.random() * 200) + 50, timeMs: Date.now() - start })
    } catch (err) {
      console.error(err)
      setError('Failed to generate content. ' + (err.message || ''))
    } finally {
      setLoading(false)
    }
  }

  function exportTxt() {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${topic.replace(/\s+/g, '_')}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container">
      <header>
        <h1>Educational Content Generator</h1>
        <p>Create lesson plans, study guides, worksheets and more.</p>
      </header>

      <form onSubmit={generate} className="form">
        <label>Topic
          <input value={topic} onChange={e => setTopic(e.target.value)} />
        </label>

        <label>Level
          <select value={level} onChange={e => setLevel(e.target.value)}>
            <option>Elementary</option>
            <option>Middle School</option>
            <option>High School</option>
            <option>Undergraduate</option>
          </select>
        </label>

        <label>Duration (minutes)
          <input value={duration} onChange={e => setDuration(e.target.value)} />
        </label>

        <label>Template
          <select value={templateId} onChange={e => setTemplateId(e.target.value)}>
            {PROMPT_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </label>

        <label>Custom Prompt (optional)
          <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder={currentTemplate.prompt}></textarea>
        </label>

        <div className="actions">
          <button type="submit" disabled={loading}>{loading ? 'Generating…' : 'Generate'}</button>
          <button type="button" onClick={exportTxt} disabled={!output}>Export .txt</button>
        </div>

        {error && <div className="error">{error}</div>}
      </form>

      <section className="output">
        <h2>Output</h2>
        <pre>{output || 'No output yet.'}</pre>
        <div className="meta">Tokens: {meta.tokens} • Response time: {meta.timeMs} ms</div>
      </section>
    </div>
  )
}
