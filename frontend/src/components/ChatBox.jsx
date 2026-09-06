import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ChatBox({ messages = [], onSend, disabled }) {
  const [text, setText] = useState('');
  const { user } = useAuth();

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex-1 max-h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">No messages yet. Start the anonymous discussion below.</p>
        )}
        {messages.map((m, i) => {
          const isMine = user?.role === 'student' ? m.senderRole === 'student' : m.senderRole !== 'student';
          return (
            <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMine ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                }`}
              >
                <p className="font-semibold text-xs mb-1 opacity-80">{m.senderLabel}</p>
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-100' : 'text-slate-400'}`}>
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={submit} className="flex items-center gap-2 p-3 border-t border-slate-200 bg-white">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type an anonymous message..."
          disabled={disabled}
          className="input-field flex-1"
        />
        <button type="submit" disabled={disabled} className="btn-primary flex items-center gap-1">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
