import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, ExternalLink, Brain } from 'lucide-react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../redux/chatSlice';
import { Link } from 'react-router-dom';

const AIChat = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversationId } = useSelector(s => s.chat);
  const { token, user } = useSelector(s => s.auth);
  const selectedExam = user?.selectedExam || null;

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const text = input.trim();
    setInput('');

    dispatch(addMessage({ role: 'user', content: text, source: 'mentor' }));
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const { data } = await axios.post('/api/ai/chat', {
        message: text,
        history: [...history, { role: 'user', content: text }],
        selectedExam,
      }, { headers: { Authorization: `Bearer ${token}` } });

      dispatch(addMessage({ role: 'assistant', content: data.reply, source: 'mentor' }));
    } catch (err) {
      dispatch(addMessage({ role: 'assistant', content: "Sorry, I encountered an error. Please try again later.", source: 'mentor' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[380px] h-[550px] bg-surface border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col mb-4 shadow-2xl relative overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Study Mentor</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">AI Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link to="/chat" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                  <ExternalLink size={16} />
                </Link>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white dark:bg-slate-950">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                  <Sparkles size={32} className="text-primary mb-3" />
                  <p className="text-sm font-semibold text-slate-500">How can I help with your preparation today?</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      max-w-[85%] px-4 py-2.5 rounded-2xl text-sm
                      ${msg.role === 'user' 
                        ? 'bg-primary text-white shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'}
                    `}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                 <div className="flex justify-start">
                   <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-all placeholder:text-slate-500"
                />
                <button 
                  type="submit" 
                  disabled={loading || !input.trim()}
                  className="absolute right-1.5 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25 relative group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default AIChat;
