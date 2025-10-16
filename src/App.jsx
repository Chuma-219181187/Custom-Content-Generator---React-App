import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";

// Main application component for the Educational Content Generator UI.
// Responsibilities:
// - Provide template selection and input controls (topic, tone, length)
// - Compose a prompt from the selected template and inputs
// - Call a generative API (if configured) or return a mocked response for local demos
// - Display output and allow exporting to a .txt file
export default function App() {
  const [template, setTemplate] = useState("lesson-plan");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Formal");
  const [length, setLength] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  // Built-in prompt templates. These are the five templates used by the UI.
  // You can add or edit these strings; placeholders: {topic}, {tone}, {length}, {grade}
  const templates = {
    "lesson-plan": "Create a detailed lesson plan on {topic} for grade {grade} students. Tone: {tone}. Length: {length}.",
    "study-guide": "Generate a study guide on {topic} with key points, definitions, and summaries. Tone: {tone}. Length: {length}.",
    "quiz": "Create a quiz with answers on {topic}. Tone: {tone}. Include {length} questions.",
    "worksheet": "Generate an interactive worksheet on {topic} with tasks and exercises. Tone: {tone}. Length: {length}.",
    "micro-lecture": "Write a short lecture script explaining {topic}. Tone: {tone}. Length: {length}."
  };

  // Build the final prompt string by replacing placeholders in the selected template.
  const generatePrompt = () => {
    const templateStr = templates[template];
    return templateStr
      .replaceAll("{topic}", topic)
      .replaceAll("{tone}", tone)
      .replaceAll("{length}", length)
      .replaceAll("{grade}", "7");
  };

  // Trigger content generation. This composes the prompt and either calls a
  // configured API endpoint (VITE_API_URL) or returns a mocked response for demo.
  // The mocked response is located in the block where `!apiUrl` is checked.
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      setOutput("");

      const apiUrl = import.meta.env.VITE_API_URL || "";

      // -------------------- MOCKED OUTPUT (for local/demo) --------------------
      // If you do not set VITE_API_URL in a .env file, the app will use a
      // mocked response so the UI can be demonstrated without a backend.
      // To use a real backend, create a `.env` with VITE_API_URL=https://... .
      if (!apiUrl) {
        // small delay to simulate network latency
        await new Promise((r) => setTimeout(r, 600));
        const content = `-- MOCKED OUTPUT --\nPrompt used:\n${generatePrompt()}\n\nGenerated content: This is a mocked educational content for ${topic}.`;
        setOutput(content);
        return;
      }

      // -------------------- REAL API CALL --------------------
      // When VITE_API_URL is provided, we POST { prompt } to that URL and
      // expect the response to contain the generated text. The exact shape
      // depends on your backend/AI provider; adjust parsing accordingly.
      const res = await axios.post(
        apiUrl,
        { prompt: generatePrompt() },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const content =
        res.data.choices?.[0]?.message?.content || res.data.result || JSON.stringify(res.data);
      setOutput(content);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error generating content.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${topic.replaceAll(" ", "_")}_${template}.txt`);
  };

  return (
    <div className="container">
      <header>
        <h1>Educational Content Generator</h1>
        <p>Create lesson plans, study guides, worksheets and more.</p>
      </header>

      <main className="form">
        <label>Template
          <select value={template} onChange={(e) => setTemplate(e.target.value)}>
            {Object.keys(templates).map((key) => (
              <option key={key} value={key}>{key.replaceAll("-", " ")}</option>
            ))}
          </select>
        </label>

        <label>Topic
          <input value={topic} onChange={(e) => setTopic(e.target.value)} />
        </label>

        <label>Tone
          <select value={tone} onChange={(e) => setTone(e.target.value)}>
            <option>Formal</option>
            <option>Friendly</option>
            <option>Creative</option>
            <option>Academic</option>
          </select>
        </label>

        <label>Length
          <select value={length} onChange={(e) => setLength(e.target.value)}>
            <option>Short</option>
            <option>Medium</option>
            <option>Long</option>
          </select>
        </label>

        <div className="actions">
          <button onClick={handleGenerate} disabled={loading}>{loading ? 'Generating…' : 'Generate'}</button>
          <button onClick={handleExport} disabled={!output}>Export .txt</button>
        </div>

        {error && <div className="error">{error}</div>}

        <section className="output">
          <h2>Output</h2>
          <pre>{output || 'No output yet.'}</pre>
        </section>
      </main>
    </div>
  );
}
