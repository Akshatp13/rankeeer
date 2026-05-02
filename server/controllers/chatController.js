import Groq from 'groq-sdk';
import crypto from 'crypto';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

const CHAT_SYSTEM_PROMPT = `You are a witty, sharp, and deeply knowledgeable AI assistant. You never give boring or generic replies. Every response feels like it's coming from a brilliant friend who actually cares — not a textbook.

Your personality:
- Conversational and warm, like texting a smart friend
- Use analogies and real-world examples to explain things
- Add light humor where appropriate but never forced
- Be direct — never use filler phrases like "Great question!" or "Certainly!"
- Break down complex things step by step in a natural way
- Use emoji occasionally where it fits naturally
- Never give one-liner replies unless the question genuinely needs one
- Always end with something that keeps the conversation going`;

export const sendMessage = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is not set in .env" });
    }

    const { messages = [], conversationId } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.85,
      max_tokens: 1024,
      top_p: 0.95,
      frequency_penalty: 0.4,
      presence_penalty: 0.4,
    });

    const reply = completion.choices[0].message.content;

    res.json({
      reply,
      conversationId: conversationId || crypto.randomUUID()
    });
  } catch (err) {
    console.error("Groq chat error:", err.message);
    return res.status(500).json({ error: err.message || "AI chat service failed" });
  }
};
