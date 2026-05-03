import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  results: [], // all test results ever taken
  weakTopics: [], // auto-computed from results
  subjectStats: {}, // per subject accuracy stats
};

const testResultsSlice = createSlice({
  name: "testResults",
  initialState,
  reducers: {
    addTestResult: (state, action) => {
      state.results.push({
        id: Date.now().toString(),
        source: action.payload.source, // "mock" or "ai-test"
        exam: action.payload.exam,
        subject: action.payload.subject,
        date: new Date().toISOString(),
        questions: action.payload.questions,
        score: action.payload.score,
        accuracy: action.payload.accuracy,
        timeTaken: action.payload.timeTaken,
        topicBreakdown: action.payload.topicBreakdown,
      });
    },
    computeWeakTopics: (state) => {
      // Group all results by topic
      const topicMap = {};
      state.results.forEach(result => {
        result.topicBreakdown?.forEach(topic => {
          if (!topicMap[topic.name]) {
            topicMap[topic.name] = {
              topic: topic.name,
              subject: topic.subject,
              totalAttempts: 0,
              totalCorrect: 0,
              totalWrong: 0,
              totalSkipped: 0,
              avgTimeTaken: 0,
            };
          }
          topicMap[topic.name].totalAttempts += topic.attempted;
          topicMap[topic.name].totalCorrect += topic.correct;
          topicMap[topic.name].totalWrong += topic.wrong;
          topicMap[topic.name].totalSkipped += topic.skipped;
        });
      });

      // Compute accuracy per topic and rank weakest first
      state.weakTopics = Object.values(topicMap)
        .map(t => ({
          ...t,
          accuracy: t.totalAttempts > 0
            ? Math.round((t.totalCorrect / t.totalAttempts) * 100)
            : 0,
          severity: t.accuracy < 40 ? "Critical"
            : t.accuracy < 65 ? "Moderate" : "Minor"
        }))
        .sort((a, b) => a.accuracy - b.accuracy);

      // Compute per-subject stats
      const subjectMap = {};
      state.results.forEach(result => {
        const subj = result.subject || "General";
        if (!subjectMap[subj]) {
          subjectMap[subj] = { correct: 0, wrong: 0, skipped: 0, total: 0 };
        }
        result.questions?.forEach(q => {
          subjectMap[subj].total++;
          if (q.userAnswer === q.correct) subjectMap[subj].correct++;
          else if (q.userAnswer === null || q.userAnswer === undefined) subjectMap[subj].skipped++;
          else subjectMap[subj].wrong++;
        });
      });
      state.subjectStats = subjectMap;
    },
    clearResults: (state) => {
      state.results = [];
      state.weakTopics = [];
      state.subjectStats = {};
    },
    setResults: (state, action) => {
      state.results = action.payload;
    }
  }
});

export const { addTestResult, computeWeakTopics, clearResults, setResults } = testResultsSlice.actions;
export default testResultsSlice.reducer;
