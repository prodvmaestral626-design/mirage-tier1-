import { useState, useEffect, useRef } from 'react';
import { PROVIDERS, PERSONAS } from './providers';
import { THEMES } from './themes';
import { callAI } from './callAI';
import { exportChat } from './utils/export.js';
import ShaderWallpaper from './components/ShaderWallpaper';
import { Mic, Square, FileText, Download, Plus, Send } from 'lucide-react';
import { fetchProviderModels } from './modelFetcher';

export default function App() {
  const [theme, setTheme] = useState(THEMES.mirage);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('');
  const [provider, setProvider] = useState('openrouter');
  const [apiKey, setApiKey] = useState(localStorage.getItem('mirage_api_key') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [fetchedModels, setFetchedModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const chatEndRef = useRef(null);

  const isDark = theme.name === 'Void';

  useEffect(() => {
    const root = document.documentElement;
    const c = theme.colors;
    Object.keys(c).forEach(key => root.style.setProperty(`--${key}`, c[key]));
    root.className = theme.cssClass || '';
  }, [theme]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dynamic Model Fetching
  useEffect(() => {
    const fetchModels = async () => {
      if (!apiKey) { setFetchedModels([]); return; }
      setLoadingModels(true);
      const models = await fetchProviderModels(provider, apiKey);
      setFetchedModels(models);
      if (models.length > 0 && !model) setModel(models[0].id);
      setLoadingModels(false);
    };
    fetchModels();
  }, [apiKey, provider]);

  const sendMessage = async () => {
    if (!input.trim() || !apiKey) return alert('Enter an API Key first');
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await callAI({ messages: newMessages, model, provider, apiKey });
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      speakText(reply);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- TTS ---
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // --- STT ---
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return alert("Speech recognition not supported in this browser.");
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
    recognition.onerror = () => setIsListening(false);
  };

  // Group dynamic models into Free/Paid
  const freeModels = fetchedModels.filter(m => m.free || m.pricePrompt === 0);
  const paidModels = fetchedModels.filter(m => !m.free && m.pricePrompt > 0);

  return (
    <>
      <ShaderWallpaper accentColor={theme.colors.accent} bgColor={theme.colors.bg} />
      <div className="app">
        {/* Header with pills */}
        <div className="header">
          <div className="pill-select">
            <span>Provider</span>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              {Object.entries(PROVIDERS).map(([key, p]) => (
                <option key={key} value={key} style={{ color: p.color }}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="pill-select">
            <span>Key</span>
            <input 
              type="password" 
              placeholder="sk-..." 
              value={apiKey} 
              onChange={(e) => { setApiKey(e.target.value); localStorage.setItem('mirage_api_key', e.target.value); }}
            />
          </div>
          <div className="pill-theme" onClick={() => setTheme(isDark ? THEMES.mirage : THEMES.void)}>
            {isDark ? '🌙' : '☀️'}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-container">
          {messages.length === 0 && (
            <div className="welcome">
              <h1>Good Morning</h1>
              <p>How can MIRAGE help you today?</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              {m.content}
            </div>
          ))}
          {isLoading && <div className="message assistant">MIRAGE is thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Composer */}
        <div className="composer-wrapper">
          <div className="composer-pill">
            <button className="btn-icon" onClick={() => setDrawerOpen(!drawerOpen)}>
              <Plus size={24} strokeWidth={1.5} />
            </button>
            <div className="pill-select" style={{ display: 'flex', gap: '8px', padding: '0 12px', background: 'transparent', boxShadow: 'none' }}>
              <span>Model</span>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)} 
                style={{ width: 'auto', minWidth: '120px' }}
              >
                {loadingModels && <option value="">Loading models...</option>}
                {!loadingModels && freeModels.length === 0 && paidModels.length === 0 && <option value="">No models fetched</option>}
                {freeModels.length > 0 && <optgroup label="🆓 Free Models"> 
                  {freeModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ($0.00/1M)</option>
                  ))}
                </optgroup>}
                {paidModels.length > 0 && <optgroup label="💎 Paid Models">
                  {paidModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (${m.pricePrompt.toFixed(2)}/1M)</option>
                  ))}
                </optgroup>}
              </select>
            </div>
            <input 
              type="text" 
              placeholder="Message MIRAGE..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="btn-send" onClick={sendMessage}>
              <Send size={18} />
            </button>
          </div>

          <div className={`drawer ${drawerOpen ? 'open' : 'closed'}`}>
            <button className="drawer-btn" onClick={() => exportChat(messages, 'txt')}><FileText size={14}/> TXT</button>
            <button className="drawer-btn" onClick={() => exportChat(messages, 'md')}><FileText size={14}/> MD</button>
            <button className="drawer-btn" onClick={() => exportChat(messages, 'json')}><FileText size={14}/> JSON</button>
            <button className="drawer-btn" onClick={() => exportChat(messages, 'pdf')}><Download size={14}/> PDF</button>
            <button className="drawer-btn" onClick={() => exportChat(messages, 'docx')}><Download size={14}/> DOCX</button>
            <button className={`drawer-btn ${isListening ? 'record' : ''}`} onClick={toggleListening}>
              {isListening ? <Square size={14}/> : <Mic size={14}/>} {isListening ? 'Stop' : 'Voice'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
