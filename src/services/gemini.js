// Google Gemini AI Service Integration for Muhammad Usman's Portfolio
// Provides high-performance, real-time streaming and structured chat completions

const SUPPORTED_GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
];

export function getGeminiApiKey() {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env && process.env.VITE_GEMINI_API_KEY) {
    return process.env.VITE_GEMINI_API_KEY;
  }
  return '';
}

/**
 * Format standard OpenAI/chat-style messages into Gemini API contents structure.
 * Merges consecutive messages with the same role and maps 'assistant' -> 'model'.
 */
function formatMessagesForGemini(messages = []) {
  const contents = [];

  for (const msg of messages) {
    if (!msg || !msg.content) continue;
    if (msg.role === 'system') continue; // Handled separately in system_instruction

    const role = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
    const text = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);

    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      // Append text to previous turn
      contents[contents.length - 1].parts[0].text += `\n\n${text}`;
    } else {
      contents.push({
        role,
        parts: [{ text }]
      });
    }
  }

  // Ensure first turn is from user if present
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.shift();
  }

  return contents;
}

/**
 * Single-turn or non-streaming chat completion with Gemini
 */
export async function getGeminiChatCompletion(messages, systemPrompt = '', options = {}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please set VITE_GEMINI_API_KEY in .env.');
  }

  const contents = formatMessagesForGemini(messages);
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  const candidateModels = [];
  if (options.model && !candidateModels.includes(options.model)) {
    candidateModels.push(options.model);
  }
  SUPPORTED_GEMINI_MODELS.forEach(m => {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  });

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const payload = {
        contents,
        generationConfig: {
          temperature: options.temperature !== undefined ? options.temperature : 0.6,
          maxOutputTokens: options.maxTokens || 1200,
        }
      };

      if (systemPrompt) {
        payload.system_instruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 14000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text.trim();
      }

      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || response.statusText || `HTTP ${response.status}`;
      lastError = new Error(`Gemini (${modelName}): ${errMsg}`);
      console.warn(`Gemini model ${modelName} failed (${response.status}), trying next candidate...`, errMsg);
    } catch (err) {
      lastError = err;
      console.warn(`Gemini model ${modelName} fetch error, trying next candidate...`, err);
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to generate a response.');
}

/**
 * High-performance streaming chat completion with Gemini via SSE
 */
export async function getGeminiChatCompletionStream(messages, systemPrompt = '', onChunk, onError, signal, options = {}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    if (onError) onError(new Error('VITE_GEMINI_API_KEY is not configured in .env.'));
    return;
  }

  const contents = formatMessagesForGemini(messages);
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  const candidateModels = [];
  if (options.model && !candidateModels.includes(options.model)) {
    candidateModels.push(options.model);
  }
  SUPPORTED_GEMINI_MODELS.forEach(m => {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  });

  let success = false;
  let lastError = null;

  for (const modelName of candidateModels) {
    if (signal?.aborted) return;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const payload = {
        contents,
        generationConfig: {
          temperature: options.temperature !== undefined ? options.temperature : 0.6,
          maxOutputTokens: options.maxTokens || 1200,
        }
      };

      if (systemPrompt) {
        payload.system_instruction = {
          parts: [{ text: systemPrompt }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || response.statusText || `HTTP ${response.status}`;
        lastError = new Error(`Gemini stream (${modelName}): ${errMsg}`);
        console.warn(`Gemini stream ${modelName} failed (${response.status}), trying next candidate...`, errMsg);
        continue;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let receivedAnyChunk = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (receivedAnyChunk) {
            onChunk('', true);
            success = true;
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Retain incomplete line fragment in buffer

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          if (cleanLine.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(cleanLine.substring(6));
              const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (chunkText) {
                receivedAnyChunk = true;
                onChunk(chunkText, false);
              }
            } catch {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      if (success) return;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      lastError = err;
      console.warn(`Gemini stream exception for ${modelName}:`, err);
    }
  }

  if (!success && !signal?.aborted) {
    if (onError) onError(lastError || new Error('Failed to stream response from Gemini.'));
  }
}

// Backward-compatibility aliases so existing modules can transparently use Gemini
export const getGroqChatCompletion = getGeminiChatCompletion;
export const getGroqChatCompletionStream = getGeminiChatCompletionStream;
export default {
  getGeminiChatCompletion,
  getGeminiChatCompletionStream,
  getGroqChatCompletion,
  getGroqChatCompletionStream,
};
