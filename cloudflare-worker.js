/**
 * Prakriti AI — Cloudflare Worker proxy for Anthropic Claude API
 *
 * Deploy steps:
 *   1. Go to https://workers.cloudflare.com and create a free account
 *   2. Click "Create Worker", paste this entire file, click "Deploy"
 *   3. Go to Settings → Variables → add secret: ANTHROPIC_API_KEY = your key
 *   4. Copy your worker URL (e.g. https://prakriti-proxy.yourname.workers.dev)
 *   5. In the Prakriti app, open the browser console and run:
 *        window.PRAKRITI_AI_PROXY_URL = "https://your-worker-url.workers.dev"
 *      Or add it permanently to index.html just before </body>:
 *        <script>window.PRAKRITI_AI_PROXY_URL = "https://your-worker-url.workers.dev";</script>
 */

const ALLOWED_ORIGIN = "*"; // lock this down to your domain in production e.g. "https://prakriti-ai-bice.vercel.app"

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const { message, context } = body;
    if (!message) return json({ error: "Missing message" }, 400);

    // Build system prompt with user's Prakriti context if available
    let system = `You are an expert Ayurvedic health guide specialising in Prakriti (constitutional) assessment. Give concise, practical, warm advice grounded in Ayurvedic principles.

Rules:
- Keep responses to 2–4 short paragraphs.
- Always relate advice to the user's dosha when known.
- Use plain, accessible language — no jargon without explanation.
- Never diagnose or replace professional medical advice.`;

    if (context?.constitution) {
      system += `\n\nThe user's Prakriti: ${context.constitution}. Dosha distribution — Vata ${context.percentages?.vata ?? "?"}%, Pitta ${context.percentages?.pitta ?? "?"}%, Kapha ${context.percentages?.kapha ?? "?"}%. Tailor all advice to this constitution.`;
    }

    // Call Anthropic
    let anthropicRes;
    try {
      anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system,
          messages: [{ role: "user", content: message }],
        }),
      });
    } catch (e) {
      return json({ error: "Failed to reach Anthropic: " + e.message }, 502);
    }

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json().catch(() => ({}));
      return json({ error: err.error?.message || `Anthropic error ${anthropicRes.status}` }, anthropicRes.status);
    }

    const data = await anthropicRes.json();
    const reply = data.content?.[0]?.text ?? "(no response)";

    return json({ reply }, 200);
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    },
  });
}
