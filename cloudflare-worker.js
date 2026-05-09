/**
 * Prakriti AI — Cloudflare Worker proxy for Anthropic Claude API
 *
 * Deploy steps:
 *   1. Go to https://workers.cloudflare.com → sign up free
 *   2. Click "Workers & Pages" → "Create" → "Worker"
 *   3. Click "Edit code", delete everything, paste this file, click "Deploy"
 *   4. Copy your worker URL (e.g. https://prakriti-proxy.yourname.workers.dev)
 *   5. In the Prakriti app → Assistant tab → paste the URL + your Anthropic key
 *
 * No environment variables needed — the API key is sent from the app
 * over HTTPS and forwarded to Anthropic server-side (bypasses CORS).
 */

const ALLOWED_ORIGIN = "*";

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return cors(new Response(null));
    }

    if (request.method !== "POST") {
      return cors(new Response("Method not allowed", { status: 405 }));
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const { message, apiKey, context } = body;
    if (!message) return json({ error: "Missing message" }, 400);
    if (!apiKey)   return json({ error: "Missing apiKey" }, 400);

    // Build system prompt with the user's Prakriti context if available
    let system = `You are an expert Ayurvedic health guide specialising in Prakriti (constitutional) assessment. Give concise, practical, warm advice grounded in Ayurvedic principles.

Rules:
- Keep responses to 2–4 short paragraphs.
- Always relate advice to the user's dosha when known.
- Use plain, accessible language — no jargon without explanation.
- Never diagnose or replace professional medical advice.`;

    if (context?.constitution) {
      system += `\n\nUser's Prakriti: ${context.constitution}. Distribution — Vata ${context.percentages?.vata ?? "?"}%, Pitta ${context.percentages?.pitta ?? "?"}%, Kapha ${context.percentages?.kapha ?? "?"}%. Tailor all advice to this constitution.`;
    }

    let groqRes;
    try {
      groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1024,
          messages: [
            { role: "system", content: system },
            { role: "user",   content: message },
          ],
        }),
      });
    } catch (e) {
      return json({ error: "Failed to reach Groq: " + e.message }, 502);
    }

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      return json({ error: err.error?.message || `Groq error ${groqRes.status}` }, groqRes.status);
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content ?? "(no response)";
    return json({ reply });
  },
};

function json(body, status = 200) {
  return cors(new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  }));
}

function cors(res) {
  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
