import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { newConversation, setActiveConversation, clearConversation } from '../redux/chatSlice';

const ConversationSidebar = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversationId } = useSelector(s => s.chat);

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const getPreview = (conv) => {
    const last = [...conv.messages].reverse().find(m => m.role === 'assistant' || m.role === 'user');
    return last ? last.content.slice(0, 48) + (last.content.length > 48 ? '…' : '') : 'No messages yet';
  };

  return (
    <div className="w-64 border-r border-white/10 bg-surface/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={() => dispatch(newConversation())}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl border border-primary/30 transition-colors font-medium text-sm"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Sync Banner */}
      <div className="mx-3 mt-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
        <p className="text-xs text-blue-300">💬 History synced across AI Chat & Mentor</p>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 mt-2">
        {conversations.length === 0 ? (
          <div className="text-center text-xs text-gray-500 mt-8 px-4 leading-relaxed">
            No conversations yet.<br />Start a new chat!
          </div>
        ) : (
          conversations.map(conv => {
            const isActive = conv.id === activeConversationId;
            return (
              <div key={conv.id} className="group relative">
                <button
                  onClick={() => dispatch(setActiveConversation(conv.id))}
                  className={`w-full flex flex-col items-start px-3 py-3 rounded-xl text-left transition-colors ${
                    isActive
                      ? 'bg-primary/15 border border-primary/25 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full mb-1">
                    <MessageSquare size={13} className="shrink-0 opacity-70" />
                    <span className="text-sm font-medium truncate flex-1">{conv.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate w-full pl-5">{getPreview(conv)}</p>
                  <span className="text-[10px] text-gray-600 pl-5 mt-0.5">{formatTime(conv.lastUpdated)}</span>
                </button>

                {/* Delete button (shows on hover) */}
                <button
                  onClick={(e) => { e.stopPropagation(); dispatch(clearConversation(conv.id)); }}
                  className="absolute top-2 right-2 p-1 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete conversation"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
