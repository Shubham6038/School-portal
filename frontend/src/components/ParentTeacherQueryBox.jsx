import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

export default function ParentTeacherQueryBox({ studentName = 'Student' }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Parent',
      text: `Hello, wanted to check on ${studentName}'s performance in Mathematics midterm.`,
      time: '10:30 AM',
      date: 'Yesterday'
    },
    {
      id: 2,
      sender: 'Class Teacher (Dr. Sharma)',
      text: `${studentName} is performing very well! Scored 85/100 and participates actively in class discussions.`,
      time: '11:15 AM',
      date: 'Yesterday'
    }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'Parent',
        text: inputText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today'
      }
    ]);
    setInputText('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-pink-500 w-5 h-5" /> Parent-Teacher Direct Communication Desk
          </h3>
          <p className="text-xs text-slate-400">Directly ask questions to Class Teacher regarding academic progress</p>
        </div>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
        {messages.map((msg) => {
          const isParent = msg.sender === 'Parent';
          return (
            <div
              key={msg.id}
              className={`p-4 rounded-2xl max-w-xl text-xs space-y-1 ${
                isParent
                  ? 'ml-auto bg-blue-600/20 border border-blue-500/30 text-slate-100'
                  : 'mr-auto bg-slate-950 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-1">
                <span className={isParent ? 'text-amber-400' : 'text-emerald-400'}>{msg.sender}</span>
                <span>{msg.date} • {msg.time}</span>
              </div>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          placeholder="Type your query for the Class Teacher..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
          required
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </form>
    </div>
  );
}
