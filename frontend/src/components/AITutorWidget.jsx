import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import API from '../api/axios';

export default function AITutorWidget({ studentClass = 'Class 10' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('Science');
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello! I am your **AB Public School AI Study Tutor**. Ask me any doubt from Mathematics, Science, English, or Social Studies!`,
      time: 'Just now'
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputQuery,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputQuery;
    setInputQuery('');
    setLoading(true);

    try {
      const res = await API.post('/ai-tutor/ask-doubt', {
        question: currentQuery,
        subject,
        studentClass
      });

      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.data?.data?.reply || 'Could not find a direct solution. Please verify question.',
        time: res.data?.data?.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: '⚠️ Network issue or server unavailable. Please try again.',
          time: 'Now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-amber-400 p-4 rounded-full shadow-2xl shadow-blue-600/50 border border-blue-400/40 flex items-center gap-2 hover:scale-105 transition-all group"
        >
          <Bot className="w-6 h-6 text-white" />
          <span className="text-xs font-black tracking-wider text-white uppercase hidden md:inline group-hover:inline">
            AI Doubt Tutor
          </span>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] md:w-[420px] h-[540px] bg-slate-900 border border-blue-900/50 rounded-3xl shadow-2xl shadow-black flex flex-col overflow-hidden backdrop-blur-xl">
          <div className="bg-slate-950 px-5 py-4 border-b border-blue-900/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 text-amber-400 border border-blue-500/30 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white tracking-wide uppercase">AB School AI Tutor</h4>
                <p className="text-[10px] text-amber-400 font-mono font-semibold">CBSE Academic Helper • {studentClass}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-950/70 px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
            {['Science', 'Mathematics', 'English', 'Social Studies'].map((sub) => (
              <button
                key={sub}
                onClick={() => setSubject(sub)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                  subject === sub
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-900/60">
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed ${
                      isBot
                        ? 'bg-slate-950 border border-blue-900/30 text-slate-200'
                        : 'bg-blue-600 text-white rounded-br-none shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-line text-[12px]">{m.text}</div>
                    <span className="block text-[9px] text-slate-400 mt-1.5 text-right font-mono">
                      {m.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>AI Tutor is analyzing syllabus...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder={`Ask doubt in ${subject}...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow transition-all"
            >
              <Send className="w-4 h-4 text-amber-300" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
