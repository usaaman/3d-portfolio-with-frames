const SUPPORTED_GROQ_MODELS = [
  'openai/gpt-oss-20b',
  'allam-2-7b',
  'qwen/qwen3.6-27b'
];

function getApiKey() {
  return import.meta.env.VITE_GROQ_API_KEY || '';
}

function stripThinking(text) {
  if (!text) return '';
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

export function getSimulatedResponse(messages) {
  const userMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  if (userMsg.includes('hi') || userMsg.includes('hello') || userMsg.includes('hey') || userMsg.includes('okay') || userMsg.includes('are you')) {
    return "Hello! I'm doing great. I am Usman's AI Representative. How can I assist you with details about his software engineering projects, technical skills, or portfolio today?";
  } else if (userMsg.includes('project') || userMsg.includes('work') || userMsg.includes('fitsphere') || userMsg.includes('medcore')) {
    return "Usman has built projects like FitSphere (a React Native fitness application), MedCore POS (a medical point-of-sale system), and AI Chat Assistant platforms. He specializes in full-stack engineering with React, Node.js, and Firebase. You can explore all details in the Projects section!";
  } else if (userMsg.includes('skill') || userMsg.includes('tech') || userMsg.includes('language') || userMsg.includes('framework')) {
    return "Usman's technical skills include React.js, JavaScript (ES6+), HTML5, CSS3, Node.js, Express, Firebase Firestore, REST APIs, Tailwind CSS, and CapCut Video Editing. He specializes in building intelligent, clean web interfaces with responsive layouts.";
  } else if (userMsg.includes('resume') || userMsg.includes('cv') || userMsg.includes('download')) {
    return "You can download Usman's latest CV by clicking the 'Download Resume' button in the header or Hero section. It is a detailed PDF showcasing his software engineering accomplishments.";
  } else if (userMsg.includes('contact') || userMsg.includes('email') || userMsg.includes('hire') || userMsg.includes('whatsapp')) {
    return "You can reach Usman directly at musmannazir97@gmail.com or contact him via WhatsApp at +92 304 5160142. Alternatively, use the interactive Contact section below!";
  } else if (userMsg.includes('education') || userMsg.includes('university') || userMsg.includes('cust') || userMsg.includes('study')) {
    return "Usman is currently in his 6th semester studying Software Engineering at Capital University of Science & Technology (CUST), Islamabad. He balances strong academic standing with real-world product development.";
  }
  return "I'm Usman's AI Representative! Ask me anything about his technical skills in React & AI integration, software projects (like FitSphere and MedCore POS), video editing experience, or academic timeline at CUST!";
}

async function simulateStream(messages, onChunk, signal) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const simulated = getSimulatedResponse(messages);
  let index = 0;
  return new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (signal?.aborted) {
        clearInterval(intervalId);
        resolve();
        return;
      }
      if (index >= simulated.length) {
        clearInterval(intervalId);
        onChunk('', true);
        resolve();
        return;
      }
      const nextChunk = simulated.substring(index, index + 4);
      onChunk(nextChunk, false);
      index += 4;
    }, 20);
  });
}

export async function getGroqChatCompletion(messages, systemPrompt = '', options = {}) {
  const apiKey = getApiKey();

  const payloadMessages = [];
  if (systemPrompt) {
    payloadMessages.push({ role: 'system', content: systemPrompt });
  }
  payloadMessages.push(...messages);

  const candidateModels = [];
  if (options.model && !candidateModels.includes(options.model)) {
    candidateModels.push(options.model);
  }
  SUPPORTED_GROQ_MODELS.forEach(m => {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  });

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: payloadMessages,
          temperature: options.temperature !== undefined ? options.temperature : 0.6,
          max_tokens: 800,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices[0]?.message?.content || '';
        return stripThinking(rawContent) || 'No response generated.';
      }

      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || response.statusText || `HTTP ${response.status}`;
      lastError = new Error(`Groq API (${modelName}): ${errMsg}`);
      console.warn(`Groq API model ${modelName} failed (${response.status}), trying next candidate...`, errMsg);
      continue;
    } catch (err) {
      lastError = err;
      console.warn(`Groq API model ${modelName} fetch error, trying next candidate...`, err);
    }
  }

  console.warn('All Groq API candidate models failed, falling back to simulated response:', lastError);
  return getSimulatedResponse(messages);
}

export async function getGroqChatCompletionStream(messages, systemPrompt = '', onChunk, onError, signal, options = {}) {
  const apiKey = getApiKey();

  const payloadMessages = [];
  if (systemPrompt) {
    payloadMessages.push({ role: 'system', content: systemPrompt });
  }
  payloadMessages.push(...messages);

  const candidateModels = [];
  if (options.model && !candidateModels.includes(options.model)) {
    candidateModels.push(options.model);
  }
  SUPPORTED_GROQ_MODELS.forEach(m => {
    if (!candidateModels.includes(m)) candidateModels.push(m);
  });

  let success = false;
  let lastError = null;

  for (const modelName of candidateModels) {
    if (signal?.aborted) return;
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: payloadMessages,
          temperature: options.temperature !== undefined ? options.temperature : 0.6,
          max_tokens: 800,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || response.statusText || `HTTP ${response.status}`;
        lastError = new Error(`Groq SSE (${modelName}): ${errMsg}`);
        console.warn(`Groq stream model ${modelName} failed (${response.status}), trying next candidate...`, errMsg);
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
        buffer = lines.pop();

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;
          if (cleanLine === 'data: [DONE]') continue;
          if (cleanLine.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(cleanLine.substring(6));
              const text = parsed.choices[0]?.delta?.content || '';
              if (text) {
                receivedAnyChunk = true;
                onChunk(text, false);
              }
            } catch {
              // ignore partial json parse issues
            }
          }
        }
      }

      if (success) return;
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      lastError = error;
      console.warn(`Groq stream model ${modelName} fetch exception, trying next candidate...`, error);
    }
  }

  // If streaming from network failed, smoothly fallback to simulated intelligence
  if (!success && !signal?.aborted) {
    console.warn('Groq stream candidate models failed, using simulated response:', lastError);
    await simulateStream(messages, onChunk, signal);
  }
}
