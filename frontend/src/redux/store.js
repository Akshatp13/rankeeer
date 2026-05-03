import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import testResultsReducer from './testResultsSlice';

// Load from localStorage on startup
const loadState = (key, defaultVal) => {
  try {
    const serialized = localStorage.getItem(key);
    return serialized ? JSON.parse(serialized) : defaultVal;
  } catch { return defaultVal; }
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    testResults: testResultsReducer,
  },
  preloadedState: {
    chat: loadState('rankrise_chat', undefined),
    testResults: loadState('rankrise_test_results', undefined),
  }
});

// Save to localStorage on every update
store.subscribe(() => {
  try {
    const { chat, testResults } = store.getState();
    localStorage.setItem('rankrise_chat', JSON.stringify(chat));
    localStorage.setItem('rankrise_test_results', JSON.stringify(testResults));
  } catch { /* silently ignore */ }
});

export default store;
