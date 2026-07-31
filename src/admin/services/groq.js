export function getSimulatedResponse(messages) {
  const userMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  if (userMsg.includes('project') || userMsg.includes('work') || userMsg.includes('fitsphere')) {
    return "Usman has built projects like FitSphere (a React Native fitness application that manages workout logic) and DevConnect (a skill-matchmaking portal for engineers). He also works on automated CMS dashboards. You can explore all details in the Projects section!";
  } else if (userMsg.includes('skill') || userMsg.includes('tech') || userMsg.includes('language')) {
    return "Usman's skills inventory includes React.js, JavaScript (ES6+), HTML5, CSS3, Firebase, Firestore, React Router, and CapCut Video Editing. He specializes in building intelligent, clean web interfaces with responsive layouts.";
  } else if (userMsg.includes('resume') || userMsg.includes('cv') || userMsg.includes('download')) {
    return "You can download Usman's latest CV by clicking the 'Download Resume' button in the header or in the Hero section. It is a PDF containing his complete credentials.";
  } else if (userMsg.includes('contact') || userMsg.includes('email') || userMsg.includes('hire') || userMsg.includes('whatsapp')) {
    return "You can reach Usman at musmannazir97@gmail.com or contact him via WhatsApp at +92 304 5160142. Alternatively, you can use the Contact Form at the bottom of this portfolio.";
  } else if (userMsg.includes('education') || userMsg.includes('university') || userMsg.includes('cust')) {
    return "Usman is currently in his 6th semester studying Software Engineering at Capital University of Science & Technology (CUST) in Islamabad. He has maintained a strong academic record while building software products.";
  }
  return "I'm Usman's AI Assistant. I can answer questions about his software engineering studies at Capital University of Science & Technology (CUST), projects like FitSphere, technical skills (React, Firebase), creative video editing, and contact info. Ask me anything!";
}

export async function getGroqChatCompletion(messages, systemPrompt = '', options = {}) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    console.warn('Groq VITE_GROQ_API_KEY is missing. Simulating AI response...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return getSimulatedResponse(messages);
  }

  const payloadMessages = [];
  if (systemPrompt) {
    payloadMessages.push({ role: 'system', content: systemPrompt });
  }
  payloadMessages.push(...messages);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'llama-3.3-70b-versatile',
        messages: payloadMessages,
        temperature: options.temperature !== undefined ? options.temperature : 0.6,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }

    if (!response.ok) {
      throw new Error(`Groq API failure: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated.';
  } catch (error) {
    console.error('Error fetching Groq completion:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

export async function getGroqChatCompletionStream(messages, systemPrompt = '', onChunk, onError, signal, options = {}) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    console.warn('Groq API Key is missing. Simulating streaming response...');
    await new Promise((resolve) => setTimeout(resolve, 400));
    const simulated = getSimulatedResponse(messages);
    
    let index = 0;
    const intervalId = setInterval(() => {
      if (signal?.aborted) {
        clearInterval(intervalId);
        return;
      }
      if (index >= simulated.length) {
        clearInterval(intervalId);
        onChunk('', true); // done = true
        return;
      }
      // Stream 3-5 chars at a time
      const nextChunk = simulated.substring(index, index + 4);
      onChunk(nextChunk, false);
      index += 4;
    }, 20);
    return;
  }

  const payloadMessages = [];
  if (systemPrompt) {
    payloadMessages.push({ role: 'system', content: systemPrompt });
  }
  payloadMessages.push(...messages);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'llama-3.3-70b-versatile',
        messages: payloadMessages,
        temperature: options.temperature !== undefined ? options.temperature : 0.6,
        max_tokens: 800,
        stream: true,
      }),
      signal,
    });

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }

    if (!response.ok) {
      throw new Error(`Groq SSE error: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onChunk('', true);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // save remaining partial chunk

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        if (cleanLine === 'data: [DONE]') continue;
        if (cleanLine.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(cleanLine.substring(6));
            const text = parsed.choices[0]?.delta?.content || '';
            if (text) {
              onChunk(text, false);
            }
          } catch {
            // ignore JSON parse failures
          }
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      onError(new Error('Request timed out. Please try again.'));
    } else {
      onError(error);
    }
  }
}
