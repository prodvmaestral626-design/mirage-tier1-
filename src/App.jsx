import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Send, Mic, Volume2, Download } from 'lucide-react';
import MetallicShader from './components/MetallicShader.jsx'; // Rename your ShaderWallpaper.jsx to MetallicShader.jsx
import { callAI } from './callAI';
import { exportChat } from './utils/export.js';
import { PROVIDERS } from './providers';
import { fetchProviderModels } from './modelFetcher';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState(localStorage.getItem('mirage_api_key') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Dynamic Models & Providers
  const [provider, setProvider] = useState('openrouter');
  const [model, setModel] = useState('');
  const [fetchedModels, setFetchedModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  
  const chatEndRef = useRef(null);

  // Load API Key & Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 1. Dynamic Model Fetcher
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

  // 2. Core Send Message Logic
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

  // 3. TTS & STT
  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return alert("Speech recognition not supported in this browser.");
    }
    if (isListening) { recognition.stop(); setIsListening(false); return; }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; recognition.interimResults = true; recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start(); setIsListening(true);
    recognition.onerror = () => setIsListening(false);
  };

  // 4. Group Models by Price
  const freeModels = fetchedModels.filter(m => m.free || m.pricePrompt === 0);
  const paidModels = fetchedModels.filter(m => !m.free && m.pricePrompt > 0);

  return (
    <div className="relative w-full h-screen flex flex-col justify-between overflow-hidden font-light">
      <MetallicShader accentColor="#D4AF37" bgColor="#121316" />
      
      {/* Ambient Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D4AF37] opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] bg-[#E4E6EB] opacity-[0.04] rounded-full blur-[120px] pointer-events-none"></div>

      {/* 1. Header (Top Pill) */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-30">
        <div className="flex items-center justify-between gap-4 p-2 pl-5 pr-2 rounded-2xl bg-[#1A1D21]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          
          {/* Left: Provider Dropdown */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity relative group">
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
              className="bg-transparent text-sm tracking-wide text-[#F5F5F7] font-medium outline-none appearance-none cursor-pointer w-24"
            >
              {Object.entries(PROVIDERS).map(([key, p]) => (
                <option key={key} value={key} className="bg-[#121316]">{p.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-0"><ChevronDown size={14} className="text-[#A1A5AB]" /></div>
          </div>

          {/* Middle: Model Dropdown */}
          <div className="relative flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_#D4AF37] ${loadingModels ? 'bg-[#A1A5AB] animate-pulse' : 'bg-[#D4AF37]'}`}></span>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              className="bg-transparent text-xs text-[#A1A5AB] outline-none appearance-none cursor-pointer w-32"
            >
              {loadingModels && <option className="bg-[#121316]">Loading...</option>}
              {freeModels.length > 0 && <optgroup label="🆓 Free Models" className="bg-[#121316]">
                {freeModels.map(m => <option key={m.id} value={m.id} className="bg-[#121316]">{m.name}</option>)}
              </optgroup>}
              {paidModels.length > 0 && <optgroup label="💎 Paid Models" className="bg-[#121316]">
                {paidModels.map(m => <option key={m.id} value={m.id} className="bg-[#121316]">{m.name}</option>)}
              </optgroup>}
            </select>
            <div className="pointer-events-none"><ChevronDown size={12} className="text-[#A1A5AB]" /></div>
          </div>

          {/* Right: API Key */}
          <div className="flex items-center gap-3">
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); localStorage.setItem('mirage_api_key', e.target.value); }}
              placeholder="API Key..."
              className="w-32 md:w-40 bg-black/20 text-xs text-[#F5F5F7] placeholder-[#A1A5AB]/50 px-3 py-1.5 rounded-full outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all font-light"
            />
          </div>
        </div>
      </header>

      {/* 2. Chat Area */}
      <main className="flex-1 overflow-y-auto pt-24 pb-40 px-4 w-full max-w-3xl mx-auto scroll-smooth">
        <div className="flex flex-col gap-6">
          {messages.length === 0 && (
            <div className="text-center mt-[20vh] text-[#A1A5AB] text-sm font-light tracking-widest uppercase">
              Welcome to the Metallic Mirage.
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex animate-fade-in-up ${msg.role === 'user' ? 'items-end justify-end' : 'items-start justify-start'}`}>
              <div className={`max-w-[80%] p-5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${
                msg.role === 'user' 
                  ? 'bg-[#2C2E33] text-[#F5F5F7] rounded-br-md border border-white/5' 
                  : 'bg-[#1A1D21]/60 backdrop-blur-xl text-[#F5F5F7] rounded-bl-md border border-white/10 border-l-2 border-l-[#D4AF37]'
              }`}>
                <p className="text-sm leading-relaxed font-light tracking-wide">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start justify-start animate-fade-in-up">
              <div className="max-w-[80%] p-5 rounded-3xl bg-[#1A1D21]/60 backdrop-blur-xl text-[#A1A5AB] rounded-bl-md border border-white/10 border-l-2 border-l-[#D4AF37]">
                <p className="text-sm font-light tracking-wide">Mirage is thinking...</p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* 3. Composer & Drawer Area */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-30 flex flex-col items-center">
        
        {/* Drawer */}
        {isDrawerOpen && (
          <div className="w-full mb-4 animate-scale-in-drawer origin-bottom">
            <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-[#1A1D21]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
              <button onClick={toggleListening} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border border-transparent active:scale-95 ${isListening ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/5 hover:bg-white/10 text-[#F5F5F7] hover:border-white/10'}`}>
                <Mic size={14} /> {isListening ? 'Recording...' : 'Voice Input'}
              </button>
              <button onClick={() => speakText(messages[messages.length - 1]?.content || '')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-[#F5F5F7] text-xs font-medium transition-all border border-transparent hover:border-white/10 active:scale-95">
                <Volume2 size={14} /> Read Aloud
              </button>
              <button onClick={() => exportChat(messages, 'json')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-[#F5F5F7] text-xs font-medium transition-all border border-transparent hover:border-white/10 active:scale-95">
                <Download size={14} /> Export
              </button>
            </div>
          </div>
        )}

        {/* Composer Pill */}
        <div className="w-full group">
          <div className="flex items-center gap-3 p-2 pl-2 pr-2 rounded-full bg-[#1A1D21]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-transform duration-300 group-focus-within:scale-[1.01] active:scale-[0.98]">
            
            {/* "+" Button */}
            <button 
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-b from-[#2C2E33] to-[#121316] border border-white/10 hover:border-[#D4AF37]/40 transition-all duration-300 shadow-inner active:scale-90 ${isDrawerOpen ? 'rotate-45' : ''}`}
            >
              <Plus size={20} className="text-[#F5F5F7]" />
            </button>

            {/* Text Input */}
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Message Mirage Ultra..."
              className="flex-1 bg-transparent outline-none text-[#F5F5F7] placeholder-[#A1A5AB] text-sm font-light tracking-wide px-1"
            />

            {/* Send Button */}
            <button onClick={sendMessage} className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-b from-[#E4E6EB] to-[#A1A5AB] hover:from-[#F5F5F7] hover:to-[#E4E6EB] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-90">
              <Send size={18} className="text-[#121316]" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
