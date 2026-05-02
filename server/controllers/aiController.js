import Groq from 'groq-sdk';
import { supabase } from '../config/supabase.js';
import { updateXP } from './statsController.js';
import { sendTestResultEmail } from '../utils/emailService.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

const MENTOR_SYSTEM_PROMPT = `You are an elite AI study mentor — part motivational coach, part genius tutor. You make learning addictive.

Your style:
- Explain concepts like a passionate teacher who loves their subject
- Use real exam scenarios, mnemonics, and memory tricks
- Call out common mistakes students make proactively
- Celebrate small wins and keep the student motivated
- Use structured formatting: headers, bullet points, bold key terms
- Never end without giving the student a clear next action
- Occasionally challenge the student with a quick question to test understanding`;

// ─── Chat With Mentor ────────────────────────────────────────────────────────
export const chatWithMentor = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY is not set in .env" });
    const { message, history = [], selectedExam } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const examContext = selectedExam
      ? `\n\nThe student is preparing for **${selectedExam}**. Tailor all explanations, examples, study plans, and advice specifically for this exam's syllabus, pattern, and difficulty level.`
      : '';

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: MENTOR_SYSTEM_PROMPT + examContext },
        ...history,
        { role: 'user', content: message }
      ],
      temperature: 0.85, max_tokens: 1024, top_p: 0.95,
      frequency_penalty: 0.4, presence_penalty: 0.4,
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("Groq mentor error:", err.message);
    return res.status(500).json({ error: err.message || "AI mentor service failed" });
  }
};

// ─── Generate Study Plan ─────────────────────────────────────────────────────
export const generateStudyPlan = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY is not set in .env" });
    const { hoursPerDay, daysUntilExam, weakTopics, selectedExam } = req.body;

    const systemPrompt = `You are an expert study planner for ${selectedExam || 'competitive exams'}.
Create a realistic, optimized day-by-day study plan based on:
- Available hours per day: ${hoursPerDay}
- Days until exam: ${daysUntilExam}
- Weak topics (prioritize these): ${JSON.stringify(weakTopics)}
- Exam syllabus and weightage for ${selectedExam || 'the exam'}

Rules:
- Prioritize high-weightage and weak topics
- Include revision days every 7 days
- Include mock test days every 14 days
- Balance subjects — don't overload one subject per day
- Last 2 weeks = only revision + mocks, no new topics

Return ONLY valid JSON in this exact format:
{
  "totalDays": ${daysUntilExam},
  "plan": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "sessions": [
        {
          "subject": "Subject Name",
          "topic": "Topic Name",
          "hours": 2,
          "type": "Learn/Practice/Revise",
          "resources": "Suggested resources"
        }
      ]
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a ${daysUntilExam}-day study plan for ${selectedExam || 'my exam'}.` }
      ],
      temperature: 0.7, max_tokens: 4000,
    });

    const raw = completion.choices[0].message.content.trim()
      .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
    
    const planData = JSON.parse(raw);
    res.json(planData);

    // Award XP for creating a study plan
    await updateXP(req.user.id, 100, 'revision', `Generated a ${daysUntilExam}-day study plan for ${selectedExam || 'exam'}`);
  } catch (err) {
    console.error("Groq study plan error:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate study plan" });
  }
};

// ─── Detect Weakness (Strategic Insight) ────────────────────────────────────
export const detectWeakness = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY not set" });
    const { weakTopics, subjectStats, selectedExam, totalTests } = req.body;

    const systemPrompt = `You are an expert academic performance coach for ${selectedExam || 'competitive exams'}.
A student has taken ${totalTests} tests and you have their performance data.
Analyze their weak areas and give a highly specific, actionable improvement strategy.

Focus on:
1. Which weak topics will have the highest ROI if improved (based on exam weightage)
2. Specific study techniques for each weak topic
3. Realistic weekly improvement targets
4. Warning signs — topics that look ok but are trending downward
5. Motivational insight — what they are actually doing well

Be conversational, specific, and encouraging. Reference ${selectedExam || 'the exam'} patterns.
Return the response in clean HTML format (h3, p, ul, li, strong). No markdown code blocks.`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `My performance data:
Weak Topics: ${JSON.stringify(weakTopics)}
Subject Stats: ${JSON.stringify(subjectStats)}
Total Tests Taken: ${totalTests}
Exam: ${selectedExam}

Give me a personalized improvement strategy.`
        }
      ],
      temperature: 0.8, max_tokens: 1500,
    });

    res.json({
      success: true,
      analysis: completion.choices[0].message.content
    });
  } catch (err) {
    console.error("Detect weakness error:", err.message);
    res.status(500).json({ error: err.message || "Failed to detect weaknesses" });
  }
};

// ─── Generate Revision Sheet ────────────────────────────────────────────────
export const generateRevisionSheet = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY not set" });
    const { topic, subject, selectedExam } = req.body;

    const systemPrompt = `You are an expert revision coach for ${selectedExam || 'competitive exams'}.
Generate a comprehensive revision sheet for ${topic} in ${subject}.

Include:
1. Key concepts and definitions (exam-focused)
2. Important formulas, dates, or facts relevant to ${selectedExam || 'the exam'}
3. Common mistakes students make in this topic
4. How this topic has appeared in previous papers
5. 3 practice questions with detailed answers

Format in clean HTML (h3, p, ul, li, strong). No markdown code blocks.`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate revision sheet for ${topic}.` }
      ],
      temperature: 0.7, max_tokens: 3000,
    });

    res.json({ sheetHTML: completion.choices[0].message.content });
    
    // Update XP for revision
    await updateXP(req.user.id, 50, 'revision', `Revised ${topic} in ${subject}`);
  } catch (err) {
    console.error("Revision sheet error:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate revision sheet" });
  }
};

// ─── Revise From Notes ───────────────────────────────────────────────────────
export const reviseFromNotes = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY not set" });
    const { notesText, notesImage, mimeType, selectedExam } = req.body;

    let content = notesText;
    if (notesImage) {
      const vision = await groq.chat.completions.create({
        model: 'llama-3.2-11b-vision-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${notesImage}` } },
            { type: 'text', text: 'Extract all the text from this image completely and accurately.' }
          ]
        }],
        max_tokens: 2000,
      });
      content = vision.choices[0].message.content;
    }

    const systemPrompt = `You are an expert study assistant. Analyze these notes and generate:
1. A concise summary (HTML format)
2. 5 Flashcards (JSON array of {front, back})
3. A Mind Map outline (JSON tree structure)
4. A 5-question Quiz (JSON array of {question, options, correct, explanation})

Return ONLY valid JSON:
{
  "summaryHTML": "...",
  "flashcards": [...],
  "mindMap": {...},
  "quiz": [...]
}`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here are the notes: ${content}` }
      ],
      temperature: 0.7, max_tokens: 4000,
    });

    const raw = completion.choices[0].message.content.trim()
      .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
    
    const result = JSON.parse(raw);
    res.json(result);

    // Award XP for revising from notes
    await updateXP(req.user.id, 75, 'revision', `Synthesized study nodes from uploaded data packets`);
  } catch (err) {
    console.error("Revise from notes error:", err.message);
    res.status(500).json({ error: err.message || "Failed to revise from notes" });
  }
};

// ─── Analyze Exam / Rank Predictor ───────────────────────────────────────────
export const analyzeExam = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY is not set in .env" });
    const { score, total, timeTaken, selectedExam, scores } = req.body;

    const examName = selectedExam || 'a competitive exam';
    const scoresText = scores
      ? Object.entries(scores).map(([k, v]) => `${k}: ${v}`).join(', ')
      : `Score: ${score} out of ${total}`;

    const systemPrompt = `You are an expert rank predictor and performance analyst for ${examName}. You have deep knowledge of ${examName} cutoffs, rank vs score statistics, college/post predictions, category-wise cutoffs, and historical trends. Be specific, data-driven, and encouraging. Format your response in clean HTML (h3, p, ul, strong, table). No markdown code blocks.`;

    const prompt = `The student just completed a ${examName} mock test.
Scores: ${scoresText}
Time Taken: ${timeTaken || 'N/A'}

Please provide:
1. Estimated rank range (optimistic, realistic, pessimistic) based on ${examName} historical data
2. What colleges/posts/selections this rank can fetch (be specific to ${examName})
3. Category-wise cutoff comparison (General / OBC / SC / ST if applicable)
4. Subject-wise strengths and weaknesses analysis
5. Comparison with last 3 years ${examName} cutoffs
6. Specific actionable tips to improve score in next attempt`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7, max_tokens: 1500, top_p: 0.95,
      frequency_penalty: 0.3, presence_penalty: 0.3,
    });
    res.json({ analysisHTML: completion.choices[0].message.content });
  } catch (err) {
    console.error("Groq exam analysis error:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate exam analysis" });
  }
};

// ─── Generate Test ───────────────────────────────────────────────────────────
export const generateTest = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY is not set in .env" });
    const { selectedExam = 'General', subject, difficulty = 'Medium', numQuestions = 10 } = req.body;

    const systemPrompt = `You are an expert test paper creator for ${selectedExam}. Generate exactly ${numQuestions} multiple choice questions from "${subject}" at ${difficulty} difficulty, strictly following ${selectedExam} exam pattern, syllabus, and question style.

Return ONLY valid JSON in this exact format, with no extra text before or after:
{
  "title": "Test title",
  "subject": "${subject}",
  "duration": <minutes as integer>,
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correct": 0,
      "explanation": "why this is correct",
      "topic": "specific topic name"
    }
  ]
}
"correct" must be a 0-indexed integer (0=A, 1=B, 2=C, 3=D). Do not include markdown, backticks, or any wrapper text.`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${numQuestions} ${difficulty} ${subject} questions for ${selectedExam}.` }
      ],
      temperature: 0.7, max_tokens: 4000, top_p: 0.95,
    });

    const raw = completion.choices[0].message.content.trim();
    // Strip any accidental markdown fences
    const jsonStr = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
    const testData = JSON.parse(jsonStr);
    res.json(testData);
  } catch (err) {
    console.error("Groq generate test error:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate test" });
  }
};

// ─── Generate Test from Notes ────────────────────────────────────────────────
export const generateTestFromNotes = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY not set' });

    const {
      notesText,
      notesImage,
      mimeType,
      numQuestions = 10,
      difficulty = 'Mixed',
      questionType = 'MCQ',
      focusArea = '',
      selectedExam,
    } = req.body;

    if (!notesText && !notesImage) {
      return res.status(400).json({ error: 'No notes content provided' });
    }

    let contentToAnalyze = notesText;

    // If image, use Groq vision model to OCR the text first
    if (notesImage) {
      const visionCompletion = await groq.chat.completions.create({
        model: 'llama-3.2-11b-vision-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${notesImage}` } },
            { type: 'text', text: 'Extract all the text from this image completely and accurately. Return only the extracted text, nothing else.' }
          ]
        }],
        max_tokens: 2000,
      });
      contentToAnalyze = visionCompletion.choices[0].message.content;
    }

    if (!contentToAnalyze || contentToAnalyze.trim().length < 50) {
      return res.status(400).json({ error: 'Notes content is too short or could not be extracted.' });
    }

    // Truncate to avoid token limit overruns (~12k chars is safe)
    const truncated = contentToAnalyze.slice(0, 12000);

    const systemPrompt = `You are an expert test creator. A student has provided their personal study notes and you must generate a high-quality test strictly based ONLY on the content in those notes. Do not add questions about topics not present in the notes.

Rules:
- Generate exactly ${numQuestions} questions
- Difficulty: ${difficulty}
- Question type: ${questionType} (MCQ = 4 options, True-False = 2 options)
- ${focusArea ? `Focus especially on: ${focusArea}` : 'Cover all topics evenly from the notes'}
- ${selectedExam ? `The student is preparing for ${selectedExam}, frame questions in that exam style` : ''}
- Every question must be directly answerable from the provided notes
- Explanations must reference the notes content

Return ONLY valid JSON with no extra text, no markdown fences:
{
  "title": "Test from My Notes",
  "subject": "From Notes",
  "duration": ${numQuestions * 2},
  "generatedFromNotes": true,
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correct": 0,
      "explanation": "explanation referencing the notes",
      "topic": "topic from notes"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Here are my study notes:\n\n${truncated}` }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const raw = completion.choices[0].message.content.trim()
      .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');

    const testData = JSON.parse(raw);

    res.json({ success: true, test: testData, extractedText: contentToAnalyze });
  } catch (err) {
    console.error('Generate test from notes error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to generate test from notes' });
  }
};

export const generateMockExam = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY is not set in .env" });
    const { selectedExam = 'General', subject, numQuestions = 20 } = req.body;

    const systemPrompt = `You are an expert exam paper setter for ${selectedExam}. Generate exactly ${numQuestions} questions for a full mock exam${subject ? ` from "${subject}"` : ''}, following ${selectedExam} exact pattern, marking scheme, and difficulty distribution.

Return ONLY valid JSON, no extra text:
{
  "title": "${selectedExam} Full Mock",
  "subject": "${subject || 'Mixed'}",
  "duration": <minutes>,
  "markingScheme": { "correct": 4, "wrong": -1, "unattempted": 0 },
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "explanation",
      "topic": "topic name",
      "marks": 4
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a ${numQuestions}-question ${selectedExam} mock exam.` }
      ],
      temperature: 0.7, max_tokens: 4000, top_p: 0.95,
    });

    const raw = completion.choices[0].message.content.trim();
    const jsonStr = raw.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
    const mockData = JSON.parse(jsonStr);
    res.json(mockData);
  } catch (err) {
    console.error("Groq mock exam error:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate mock exam" });
  }
};

export const submitTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { exam, subject, score, total, timeTaken } = req.body;
    
    const accuracy = Math.round((score / total) * 100);
    
    // 1. Save test result
    const { data, error } = await supabase
      .from('test_results')
      .insert([{
        user_id: userId,
        exam,
        subject,
        score,
        total,
        accuracy,
        time_taken: timeTaken
      }])
      .select()
      .single();

    if (error) throw error;

    // 2. Award XP based on score percentage
    const xpAwarded = Math.floor((score / total) * 200); // Max 200 XP per test
    await updateXP(userId, xpAwarded, 'test', `Completed ${subject} test with ${accuracy}% accuracy`);

    // 3. Update total tests and avg score in user_stats
    const { data: stats } = await supabase.from('user_stats').select('total_tests, average_score').eq('user_id', userId).single();
    const newTotal = (stats?.total_tests || 0) + 1;
    const newAvg = stats?.average_score ? ((stats.average_score * stats.total_tests) + accuracy) / newTotal : accuracy;

    await supabase.from('user_stats').update({
      total_tests: newTotal,
      average_score: Math.round(newAvg)
    }).eq('user_id', userId);

    // Send test result email (async)
    sendTestResultEmail(req.user.email, req.user.user_metadata?.name || 'Student', {
      exam,
      subject,
      score,
      total,
      accuracy,
      xpEarned: xpAwarded
    });

    res.json({ success: true, xpEarned: xpAwarded, result: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
