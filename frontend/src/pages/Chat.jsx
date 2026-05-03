import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ConversationSidebar from '../components/ConversationSidebar';
import { Send, Bot, User } from 'lucide-react';
import api from '../utils/api';
import { addMessage } from '../redux/chatSlice';

const SOURCE_BADGE = {
  chat: { label: 'Chat', cls: 'bg-blue-500/20 text-blue-300' },
  mentor: { label: 'Mentor', cls: 'bg-purple-500/20 text-purple-300' },
};

const Chat = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversationId } = useSelector(s => s.chat);
  const { token } = useSelector(s => s.auth);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const text = input.trim();
    setInput('');

    // Write user message to Redux immediately
    dispatch(addMessage({ role: 'user', content: text, source: 'chat' }));
    setIsTyping(true);

    try {
      // Build history from current conversation for context
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const { data } = await api.post('/api/chat/message', {
        messages: [...history, { role: 'user', content: text }],
        conversationId: activeConversationId,
      });

      dispatch(addMessage({ role: 'assistant', content: data.reply, source: 'chat' }));
    } catch (err) {
      let msg = 'Sorry, something went wrong.';
      const apiErr = err.response?.data?.error;
      if (apiErr) msg = typeof apiErr === 'string' ? apiErr : apiErr.message ?? JSON.stringify(apiErr);
      dispatch(addMessage({ role: 'assistant', content: `**Error:** ${msg}`, source: 'chat' }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const renderMarkdown = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).replace(/^[a-z]+\n/, '');
        return (
          <pre key={i} className="bg-[#1a1a2e] p-4 rounded-lg overflow-x-auto text-sm my-3 border border-white/10 text-blue-300 font-mono shadow-inner">
            <code>{code}</code>
          </pre>
        );
      }
      return (
        <span key={i}>
          {part.split(/(\*\*.*?\*\*)/g).map((t, j) =>
            t.startsWith('**') && t.endsWith('**')
              ? <strong key={j} className="font-bold text-white">{t.slice(2, -2)}</strong>
              : t
          )}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col">
      <Topbar />
      <Sidebar />

      <main className="pl-72 pt-24 flex-1 flex overflow-hidden" style={{ height: '100vh' }}>
        {/* Shared conversation sidebar */}
        <ConversationSidebar />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-black/20">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 pt-20">
                <Bot size={64} className="mb-6 text-primary" />
                <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
                <p className="max-w-md text-gray-400">Ask anything — this chat shares history with your AI Mentor.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-md ${
                  msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-surface border border-white/10'
                }`}>
                  {msg.role === 'user' ? <User size={20} className="text-white" /> : <Bot size={22} className="text-primary" />}
                </div>

                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  {/* Source badge */}
                  {msg.source && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1 ${SOURCE_BADGE[msg.source]?.cls}`}>
                      {SOURCE_BADGE[msg.source]?.label}
                    </span>
                  )}
                  <div className={`px-5 py-3.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm shadow-md'
                      : 'bg-surface border border-white/10 text-gray-200 rounded-tl-sm shadow-sm'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                      {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 mx-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 max-w-4xl mx-auto">
                <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-surface border border-white/10 shadow-md">
                  <Bot size={22} className="text-primary" />
                </div>
                <div className="bg-surface border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5 h-[52px]">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-background/80 backdrop-blur-md border-t border-white/10 shrink-0">
            <div className="max-w-4xl mx-auto relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Chat… (Shift+Enter for newline)"
                rows={1}
                disabled={isTyping}
                className="w-full bg-surface border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none min-h-[60px] max-h-[200px] shadow-sm transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-3 bottom-3 p-2.5 bg-primary hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl transition-all shadow-md"
              >
                <Send size={18} />
              </button>
              <div className="absolute -bottom-5 right-2 text-xs text-gray-600">{input.length} / 2000</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
