import { createSlice } from '@reduxjs/toolkit';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const makeMessage = (role, content, source) => ({
  id: uid(),
  role,           // "user" | "assistant"
  content,
  timestamp: Date.now(),
  source,         // "chat" | "mentor"
});

const makeConversation = (firstMessage) => ({
  id: uid(),
  title: firstMessage.length > 40 ? firstMessage.slice(0, 40) + '…' : firstMessage,
  messages: [],
  createdAt: Date.now(),
  lastUpdated: Date.now(),
});

// ─── Persist helpers ──────────────────────────────────────────────────────────
const load = () => {
  try {
    const raw = localStorage.getItem('rankrise_chat');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

// ─── Initial state (hydrate from localStorage on first load) ──────────────────
const persisted = load();
const initialState = persisted || {
  conversations: [],
  activeConversationId: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Start a brand-new conversation (returns its id via action for callers)
    newConversation: (state) => {
      state.activeConversationId = null;
    },

    // Add a message — if no active conversation exists, create one first
    addMessage: (state, action) => {
      const { content, role, source } = action.payload;
      const msg = makeMessage(role, content, source);

      let conv = state.conversations.find(c => c.id === state.activeConversationId);

      if (!conv) {
        // Auto-create conversation titled from first user message
        const title = role === 'user'
          ? (content.length > 40 ? content.slice(0, 40) + '…' : content)
          : 'New Conversation';
        conv = makeConversation(title);
        conv.title = title;
        state.conversations.unshift(conv);
        state.activeConversationId = conv.id;
      }

      conv.messages.push(msg);
      conv.lastUpdated = Date.now();
    },

    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload; // conversation id
    },

    clearConversation: (state, action) => {
      const id = action.payload ?? state.activeConversationId;
      state.conversations = state.conversations.filter(c => c.id !== id);
      if (state.activeConversationId === id) {
        state.activeConversationId = state.conversations[0]?.id ?? null;
      }
    },

    clearAll: (state) => {
      state.conversations = [];
      state.activeConversationId = null;
    },
  },
});

export const {
  newConversation,
  addMessage,
  setActiveConversation,
  clearConversation,
  clearAll,
} = chatSlice.actions;

export default chatSlice.reducer;
