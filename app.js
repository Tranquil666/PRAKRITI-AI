/**
 * Prakriti app controller. Handles section routing, the assessment flow,
 * persistent history, diet and lifestyle render, the AI chat (with proxy
 * fallback to a deterministic local guide), and rule-based symptom analysis.
 *
 * State lives in localStorage under the key `prakriti.v1`.
 */

(function () {
  "use strict";

  // ──────────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────────
  const $  = (id) => document.getElementById(id);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const STORAGE_KEY = "prakriti.v1";

  const escapeHTML = (s) => String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const setSafe = (el, html) => {
    if (window.setSafeHTML) return window.setSafeHTML(el, html);
    el.innerHTML = html;
  };

  const todayStamp = () => new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  }).toUpperCase();

  // Persistent state
  function loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { history: [] };
    } catch { return { history: [] }; }
  }
  function saveStore(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  // ──────────────────────────────────────────────────────────────────
  // App state
  // ──────────────────────────────────────────────────────────────────
  const state = {
    currentView: "home",
    currentQ: 0,
    answers: new Array(QUESTIONS.length).fill(null),
    lastResult: null,
    store: loadStore(),
  };

  // ──────────────────────────────────────────────────────────────────
  // Routing
  // ──────────────────────────────────────────────────────────────────
  function navigate(view) {
    state.currentView = view;
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + view));
    $$(".nav-rail button").forEach((b) => {
      b.classList.toggle("active", b.dataset.view === view);
    });

    // Show "Result" tab in nav once a result exists.
    const resultTab = document.querySelector('.nav-rail button[data-view="result"]');
    if (resultTab) resultTab.style.display = state.lastResult ? "" : "none";

    // Hydrate per-section content on first visit
    if (view === "diet")      renderDiet();
    if (view === "lifestyle") renderLifestyle();
    if (view === "history")   renderHistory();
    if (view === "ai")        ensureChatBootstrap();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ──────────────────────────────────────────────────────────────────
  // Assessment
  // ──────────────────────────────────────────────────────────────────
  function renderQuestion() {
    const q = QUESTIONS[state.currentQ];
    $("q-counter").textContent = (state.currentQ + 1) + "/" + QUESTIONS.length;
    document.querySelector(".progress-bar").style.setProperty(
      "--progress", ((state.currentQ + 1) / QUESTIONS.length * 100) + "%"
    );

    const sel = state.answers[state.currentQ];
    const html = `
      <div class="question" role="group" aria-labelledby="qt-${state.currentQ}">
        <div class="q-num">Question ${String(state.currentQ + 1).padStart(2, "0")}</div>
        <div class="q-text" id="qt-${state.currentQ}">${escapeHTML(q.text)}</div>
        <div class="options" role="radiogroup">
          ${q.options.map((opt, i) => `
            <label class="option ${sel === i ? "selected" : ""}" role="radio" aria-checked="${sel === i}" tabindex="0" data-idx="${i}">
              <input type="radio" name="q${state.currentQ}" value="${i}" ${sel === i ? "checked" : ""}>
              <span class="marker" aria-hidden="true"></span>
              <span class="label">${escapeHTML(opt)}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
    setSafe($("question-container"), html);

    $$(".option", $("question-container")).forEach((el) => {
      const idx = +el.dataset.idx;
      const choose = () => {
        state.answers[state.currentQ] = idx;
        $$(".option", $("question-container")).forEach((o) => {
          o.classList.toggle("selected", +o.dataset.idx === idx);
          o.setAttribute("aria-checked", +o.dataset.idx === idx);
        });
        $("next-btn").disabled = false;
      };
      el.addEventListener("click", choose);
      el.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); choose(); }
      });
    });

    $("prev-btn").disabled = state.currentQ === 0;
    $("next-btn").textContent = state.currentQ === QUESTIONS.length - 1 ? "See result →" : "Next →";
  }

  async function showResult() {
    if (typeof window.realPrakritiModel === "undefined") {
      alert("Classifier not loaded. Reload the page.");
      return;
    }
    const out = await window.realPrakritiModel.predictDosha(state.answers);
    state.lastResult = {
      ...out,
      answers: state.answers.slice(),
      timestamp: new Date().toISOString(),
      stamp: todayStamp(),
    };

    // Persist
    state.store.history = state.store.history || [];
    state.store.history.unshift(state.lastResult);
    if (state.store.history.length > 50) state.store.history.length = 50;
    saveStore(state.store);

    paintResult();
    navigate("result");
  }

  function paintResult() {
    const r = state.lastResult;
    if (!r) return;
    $("constitution-name").textContent = r.constitution.replace("+", " · ");
    $("confidence-text").textContent = r.confidence.toUpperCase() + " confidence reading";
    $("result-stamp").textContent = r.stamp || todayStamp();

    ["vata", "pitta", "kapha"].forEach((d) => {
      $("pct-" + d).textContent = r.percentages[d] + "%";
      // animate next frame so the transition runs from 0
      requestAnimationFrame(() => {
        $("bar-" + d).style.width = r.percentages[d] + "%";
      });
    });

    const m = window.PRAKRITI_MODEL_METRICS;
    if (m) {
      $("model-explanation").textContent =
        `A ${window.PRAKRITI_MODEL_NAME} classifier trained on 5,000 labelled assessments, ` +
        `achieving ${(m.accuracy_mean * 100).toFixed(1)}% cross-validated accuracy ` +
        `(macro-F1 ${m.f1_macro_mean.toFixed(2)}). It outscored the alternatives:`;
    }

    const tbody = $("bakeoff-body");
    tbody.innerHTML = "";
    (window.PRAKRITI_BAKEOFF || []).forEach((row) => {
      const tr = document.createElement("tr");
      if (row.name === window.PRAKRITI_MODEL_NAME) tr.className = "winner";
      tr.innerHTML = `
        <td>${escapeHTML(row.name)}</td>
        <td>${(row.accuracy_mean * 100).toFixed(1)}% ± ${(row.accuracy_std * 100).toFixed(1)}</td>
        <td>${row.f1_macro_mean.toFixed(3)} ± ${row.f1_macro_std.toFixed(3)}</td>
      `;
      tbody.appendChild(tr);
    });

    // Recommendations
    const doshas = r.constitution.split("+");
    const recs = $("recs");
    recs.innerHTML = "";
    [["What to favor in food", "diet"], ["Lifestyle adjustments", "lifestyle"], ["What to ease off", "avoid"]]
      .forEach(([title, key]) => {
        const items = new Set();
        doshas.forEach((d) => (REC_DB[d] || REC_DB.vata)[key].forEach((it) => items.add(it)));
        const card = document.createElement("article");
        card.className = "rec-card";
        card.innerHTML = `<h4>${escapeHTML(title)}</h4><ul>${[...items].map((i) => `<li>${escapeHTML(i)}</li>`).join("")}</ul>`;
        recs.appendChild(card);
      });
  }

  // ──────────────────────────────────────────────────────────────────
  // Diet plan
  // ──────────────────────────────────────────────────────────────────
  function renderDiet() {
    const body = $("diet-body");
    if (!state.lastResult) {
      body.innerHTML = `
        <div class="empty">
          <h3>The plan needs a reading first</h3>
          <p>Complete the fifteen-question assessment and a diet plan tailored to your primary dosha will appear here, with meal-by-meal guidance and the foods to favor or ease off.</p>
          <button class="btn" data-jump="assessment">Begin the reading</button>
        </div>
      `;
      $("diet-dosha-stamp").textContent = "—";
      bindJumpButtons(body);
      return;
    }
    const primary = state.lastResult.constitution.split("+")[0];
    const plan = DIET_PLAN[primary] || DIET_PLAN.vata;
    $("diet-dosha-stamp").textContent = "FOR " + primary.toUpperCase();

    const meals = plan.meals.map((m) => `
      <article class="meal-card">
        <span class="when">${escapeHTML(m.when)}</span>
        <h3>${escapeHTML(m.title)}</h3>
        <p>${escapeHTML(m.body)}</p>
      </article>
    `).join("");

    body.innerHTML = `
      <p style="font-size: 1.15rem; color: var(--ink-soft); max-width: 60ch; margin-bottom: 2rem;">
        <span style="font-family: var(--serif-display); font-size: 2.5rem; float: left; line-height: 0.85; padding: 0.35rem 0.5rem 0 0; color: var(--saffron); font-weight: 500;">${plan.principle.charAt(0)}</span>${escapeHTML(plan.principle.slice(1))}
      </p>

      <div class="columns-3" style="margin-top: 2.5rem;">${meals}</div>

      <div style="margin-top: 3rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <div>
          <h4 style="font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--moss); margin-bottom: 1rem;">Favor</h4>
          <ul class="pill-list favor">${plan.favor.map((f) => `<li>${escapeHTML(f)}</li>`).join("")}</ul>
        </div>
        <div>
          <h4 style="font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--saffron); margin-bottom: 1rem;">Ease off</h4>
          <ul class="pill-list avoid">${plan.avoid.map((f) => `<li>${escapeHTML(f)}</li>`).join("")}</ul>
        </div>
      </div>

      <div style="margin-top: 3rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-ghost btn-sm" onclick="window.print()">Print this plan</button>
        <button class="btn btn-ghost btn-sm" data-jump="lifestyle">See lifestyle plan →</button>
      </div>
    `;
    bindJumpButtons(body);
  }

  // ──────────────────────────────────────────────────────────────────
  // Lifestyle plan
  // ──────────────────────────────────────────────────────────────────
  function renderLifestyle() {
    const body = $("lifestyle-body");
    if (!state.lastResult) {
      body.innerHTML = `
        <div class="empty">
          <h3>A daily routine, calibrated to your nature</h3>
          <p>Take the reading first and a Dinacharya (daily routine) plan will appear here — wake time, exercise, meals, sleep, and seasonal practices keyed to your primary dosha.</p>
          <button class="btn" data-jump="assessment">Begin the reading</button>
        </div>
      `;
      $("lifestyle-dosha-stamp").textContent = "—";
      bindJumpButtons(body);
      return;
    }
    const primary = state.lastResult.constitution.split("+")[0];
    const plan = LIFESTYLE_PLAN[primary] || LIFESTYLE_PLAN.vata;
    $("lifestyle-dosha-stamp").textContent = "FOR " + primary.toUpperCase();

    const steps = plan.timeline.map((s) => `
      <div class="timeline-step">
        <div class="time">${escapeHTML(s.time)}</div>
        <h4>${escapeHTML(s.title)}</h4>
        <p>${escapeHTML(s.body)}</p>
      </div>
    `).join("");

    body.innerHTML = `
      <p style="font-size: 1.15rem; color: var(--ink-soft); max-width: 60ch; margin-bottom: 2rem;">
        <span style="font-family: var(--serif-display); font-size: 2.5rem; float: left; line-height: 0.85; padding: 0.35rem 0.5rem 0 0; color: var(--saffron); font-weight: 500;">${plan.principle.charAt(0)}</span>${escapeHTML(plan.principle.slice(1))}
      </p>

      <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 3rem; margin-top: 3rem;">
        <div>
          <h4 style="font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--saffron); margin-bottom: 1rem;">Daily routine — Dinacharya</h4>
          <div class="timeline">${steps}</div>
        </div>
        <div>
          <h4 style="font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--saffron); margin-bottom: 1rem;">Practices to weave in</h4>
          <ul class="pill-list" style="flex-direction: column;">${plan.practices.map((p) => `<li style="display: block; padding: 0.6rem 0.9rem; border-color: var(--rule); color: var(--ink-soft); text-decoration: none;">${escapeHTML(p)}</li>`).join("")}</ul>
        </div>
      </div>

      <div style="margin-top: 3rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-ghost btn-sm" onclick="window.print()">Print this plan</button>
        <button class="btn btn-ghost btn-sm" data-jump="diet">See diet plan →</button>
      </div>
    `;
    bindJumpButtons(body);
  }

  function bindJumpButtons(root) {
    $$("[data-jump]", root).forEach((b) => {
      b.addEventListener("click", () => navigate(b.dataset.jump));
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // History / Progress
  // ──────────────────────────────────────────────────────────────────
  function renderHistory() {
    const h = state.store.history || [];
    const body = $("history-body");
    $("history-count").textContent = h.length + " reading" + (h.length === 1 ? "" : "s");

    if (h.length === 0) {
      body.innerHTML = `
        <div class="empty">
          <h3>No readings yet</h3>
          <p>Once you complete a reading, it is stored locally on this device. You can return any time to see how your distribution shifts week to week.</p>
          <button class="btn" data-jump="assessment">Begin the first reading</button>
        </div>
      `;
      bindJumpButtons(body);
      return;
    }

    // Stats
    const dominant = {};
    h.forEach((r) => {
      const d = r.constitution.split("+")[0];
      dominant[d] = (dominant[d] || 0) + 1;
    });
    const mostFrequent = Object.entries(dominant).sort((a, b) => b[1] - a[1])[0];
    const last = h[0];
    const first = h[h.length - 1];
    const delta = h.length >= 2
      ? (() => {
          const lastP = last.percentages[last.constitution.split("+")[0]];
          const firstP = first.percentages[last.constitution.split("+")[0]];
          return lastP - firstP;
        })()
      : 0;

    // Sparklines (one per dosha)
    function sparkline(d) {
      if (h.length < 2) return `<svg viewBox="0 0 200 60" preserveAspectRatio="none"><line x1="0" y1="30" x2="200" y2="30" stroke="var(--rule)" stroke-width="1"/></svg>`;
      const vals = h.slice().reverse().map((r) => r.percentages[d]);
      const max = 100, min = 0;
      const w = 200, hgt = 60, pad = 4;
      const step = (w - pad * 2) / (vals.length - 1);
      const pts = vals.map((v, i) => {
        const x = pad + i * step;
        const y = pad + (1 - (v - min) / (max - min)) * (hgt - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      const color = d === "vata" ? "var(--indigo)" : d === "pitta" ? "var(--saffron)" : "var(--clay)";
      return `
        <svg viewBox="0 0 ${w} ${hgt}" preserveAspectRatio="none">
          <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          ${vals.map((v, i) => {
            const x = pad + i * step;
            const y = pad + (1 - (v - min) / (max - min)) * (hgt - pad * 2);
            return `<circle cx="${x}" cy="${y}" r="2" fill="${color}"/>`;
          }).join("")}
        </svg>
      `;
    }

    body.innerHTML = `
      <div class="stats">
        <div class="stat">
          <div class="label">Total</div>
          <div class="value">${h.length}</div>
          <div class="sub">${h.length === 1 ? "reading" : "readings"}</div>
        </div>
        <div class="stat">
          <div class="label">Most frequent</div>
          <div class="value" style="text-transform: capitalize;">${escapeHTML(mostFrequent[0])}</div>
          <div class="sub">${mostFrequent[1]} of ${h.length}</div>
        </div>
        <div class="stat">
          <div class="label">Latest</div>
          <div class="value" style="text-transform: capitalize;">${escapeHTML(last.constitution.replace("+", " · "))}</div>
          <div class="sub">${escapeHTML(last.stamp || "")}</div>
        </div>
        <div class="stat">
          <div class="label">Trend</div>
          <div class="value">${delta >= 0 ? "+" : ""}${delta}</div>
          <div class="sub">since first reading</div>
        </div>
      </div>

      <div class="columns-3" style="margin-top: 2rem;">
        <div class="sparkline-card"><h4>Vata over time</h4>${sparkline("vata")}</div>
        <div class="sparkline-card"><h4>Pitta over time</h4>${sparkline("pitta")}</div>
        <div class="sparkline-card"><h4>Kapha over time</h4>${sparkline("kapha")}</div>
      </div>

      <h4 style="font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-faint); margin: 3rem 0 1rem;">All readings</h4>
      <div class="history-list">
        ${h.map((r, idx) => {
          const v = r.percentages.vata, p = r.percentages.pitta, k = r.percentages.kapha;
          return `
            <article class="history-item" data-idx="${idx}">
              <span class="when">${escapeHTML(r.stamp || "")}</span>
              <span class="what">${escapeHTML(r.constitution.replace("+", " · "))}</span>
              <span class="mini-bars" aria-hidden="true">
                <span class="mini-bar vata"  style="--w:${v}%"></span>
                <span class="mini-bar pitta" style="--w:${p}%"></span>
                <span class="mini-bar kapha" style="--w:${k}%"></span>
              </span>
              <button class="delete" aria-label="Delete this reading" data-idx="${idx}">×</button>
            </article>
          `;
        }).join("")}
      </div>

      <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <button class="btn btn-ghost btn-sm" id="export-history">Export as JSON</button>
        <button class="btn btn-ghost btn-sm" id="clear-history">Clear all readings</button>
      </div>
    `;

    // Item interactions
    $$(".history-item .delete", body).forEach((b) => {
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = +b.dataset.idx;
        if (!confirm("Delete this reading?")) return;
        state.store.history.splice(idx, 1);
        saveStore(state.store);
        renderHistory();
      });
    });
    $$(".history-item", body).forEach((it) => {
      it.addEventListener("click", () => {
        const idx = +it.dataset.idx;
        state.lastResult = state.store.history[idx];
        paintResult();
        navigate("result");
      });
    });

    $("export-history").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state.store, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "prakriti-history.json"; a.click();
      URL.revokeObjectURL(url);
    });
    $("clear-history").addEventListener("click", () => {
      if (!confirm("Permanently delete every reading on this device?")) return;
      state.store.history = [];
      state.lastResult = null;
      saveStore(state.store);
      renderHistory();
    });
  }

  // ──────────────────────────────────────────────────────────────────
  // AI Assistant — chat with proxy fallback
  // ──────────────────────────────────────────────────────────────────
  let chatBootstrapped = false;
  function ensureChatBootstrap() {
    if (chatBootstrapped) return;
    chatBootstrapped = true;

    // Tabs
    $$(".chat-tabs button").forEach((tab) => {
      tab.addEventListener("click", () => {
        $$(".chat-tabs button").forEach((b) => b.classList.toggle("active", b === tab));
        $$(".chat-pane").forEach((p) => p.classList.toggle("active", p.dataset.pane === tab.dataset.tab));
        if (tab.dataset.tab === "insights") renderInsights();
      });
    });

    // Quick actions
    $$("#chat-quick-actions button").forEach((b) => {
      b.addEventListener("click", () => sendChat(b.dataset.q));
    });

    // Chat input
    $("chat-send").addEventListener("click", () => {
      const v = $("chat-input").value.trim();
      if (v) { sendChat(v); $("chat-input").value = ""; }
    });
    $("chat-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); $("chat-send").click(); }
    });

    // Symptom analysis
    $("symptoms-analyze").addEventListener("click", analyseSymptoms);

    // Gemini key setup
    const keyInput  = $("gemini-key-input");
    const keySave   = $("gemini-key-save");
    const keyStatus = $("gemini-key-status");
    const stored = localStorage.getItem("prakriti.geminiKey");
    if (stored) { keyInput.value = stored; keyStatus.textContent = "✓ key saved"; }
    keySave.addEventListener("click", () => {
      const k = keyInput.value.trim();
      if (!k) { localStorage.removeItem("prakriti.geminiKey"); keyStatus.textContent = "cleared"; updateAiStatus(); return; }
      localStorage.setItem("prakriti.geminiKey", k);
      keyStatus.textContent = "✓ key saved";
      updateAiStatus();
    });

    // Status
    updateAiStatus();
  }

  function updateAiStatus() {
    const status = $("ai-status");
    if (!status) return;
    const key = localStorage.getItem("prakriti.geminiKey");
    if (key) { status.textContent = "ONLINE · Gemini"; status.style.color = "var(--kapha)"; }
    else if (window.PRAKRITI_AI_PROXY_URL) { status.textContent = "ONLINE · proxy"; status.style.color = "var(--kapha)"; }
    else { status.textContent = "OFFLINE · local guide"; status.style.color = "var(--text-3)"; }
  }

  function appendMsg(role, html) {
    const win = $("chat-window");
    const div = document.createElement("div");
    div.className = "msg " + role;
    div.innerHTML = `<span class="who">${role === "user" ? "U." : role === "thinking" ? "…" : "A."}</span><div class="body"></div>`;
    setSafe(div.querySelector(".body"), html);
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
    return div;
  }

  function buildGeminiSystemPrompt() {
    const r = state.lastResult;
    let prompt = `You are an expert Ayurvedic health guide specialising in Prakriti (constitutional) assessment. Give concise, practical, warm advice grounded in Ayurvedic principles.

Rules:
- Keep responses to 2–4 short paragraphs.
- Always relate advice to the user's dosha when known.
- Use plain, accessible language — no jargon without explanation.
- Never diagnose or replace professional medical advice.`;
    if (r) {
      prompt += `\n\nThe user's Prakriti result: ${r.constitution} (${r.confidence} confidence). Distribution — Vata ${r.percentages.vata}%, Pitta ${r.percentages.pitta}%, Kapha ${r.percentages.kapha}%. Tailor all advice to this constitution.`;
    }
    return prompt;
  }

  async function callGemini(apiKey, userMessage) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: buildGeminiSystemPrompt() }] },
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini error ${res.status}`);
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "(no response)";
  }

  async function sendChat(text) {
    appendMsg("user", `<p>${escapeHTML(text)}</p>`);
    const thinking = appendMsg("thinking", "<p>Thinking…</p>");
    thinking.classList.add("thinking");

    let reply = "";
    try {
      const geminiKey = localStorage.getItem("prakriti.geminiKey");
      if (geminiKey) {
        reply = await callGemini(geminiKey, text);
      } else if (window.PRAKRITI_AI_PROXY_URL) {
        const res = await fetch(window.PRAKRITI_AI_PROXY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            context: state.lastResult ? {
              constitution: state.lastResult.constitution,
              percentages: state.lastResult.percentages,
            } : null,
          }),
        });
        const data = await res.json();
        reply = data.reply || data.text || "(no reply)";
      } else {
        reply = localGuide(text);
      }
    } catch (e) {
      reply = `Error: ${e.message}. Falling back to local guide.\n\n` + localGuide(text);
    }

    thinking.remove();
    const html = reply.split(/\n{2,}/).map((p) => `<p>${escapeHTML(p)}</p>`).join("");
    appendMsg("assistant", html);
  }

  // Local rule-based guide. Keyword-driven, references the last result if any.
  function localGuide(text) {
    const t = text.toLowerCase();
    const r = state.lastResult;
    const primary = r ? r.constitution.split("+")[0] : null;

    if (/(constitution|dosha|prakriti|reading|result)/.test(t)) {
      if (!r) return "You have not taken a reading yet. Begin one from the Home tab and your result will appear in this conversation.";
      return `Your latest reading was ${r.constitution.replace("+", " and ")} (${r.confidence} confidence). Your distribution is Vata ${r.percentages.vata}%, Pitta ${r.percentages.pitta}%, Kapha ${r.percentages.kapha}%. The dominant dosha tends to set the rhythm of your routine; the secondary fine-tunes it. Open the Diet and Lifestyle tabs for a plan tailored to ${primary}.`;
    }
    if (/(breakfast|morning meal)/.test(t)) {
      if (!primary) return "Pick a reading first and I will tailor breakfast suggestions to it.";
      return DIET_PLAN[primary].meals.find((m) => /breakfast|waking/i.test(m.when)).body;
    }
    if (/(sleep|insomnia|tired)/.test(t)) {
      if (primary === "vata")  return "Vata-pattern sleep responds best to a fixed bedtime, warm milk with nutmeg, and avoiding screens after 22:00. A short oil massage to the feet before bed is classically prescribed.";
      if (primary === "pitta") return "Pitta-pattern wakefulness usually means working too late. Try a wind-down by 21:00, a cool room, and a moonlight walk before bed when possible.";
      if (primary === "kapha") return "Kapha sleep is rarely the problem — oversleeping is. Set a hard 22:00 bedtime and a 5:30 alarm; do not nap during the day.";
      return "Better sleep starts with a consistent bedtime and a wind-down hour without screens, regardless of dosha.";
    }
    if (/(routine|dinacharya|day|schedule)/.test(t)) {
      if (!primary) return "Take a reading and I will propose a routine matched to your dominant dosha.";
      return LIFESTYLE_PLAN[primary].principle + " Open the Lifestyle tab for the full timeline.";
    }
    if (/(stress|anxiety|anger|calm)/.test(t)) {
      if (primary === "vata")  return "Vata stress tends to manifest as anxiety, racing thoughts, and irregular breath. The single most reliable intervention is warm sesame oil self-massage and Nadi Shodhana (alternate-nostril breathing) for ten minutes.";
      if (primary === "pitta") return "Pitta stress comes out as irritation and sharp criticism. Cool the system: Sheetali pranayama, a cold splash of water on the face, and refusing to argue while hungry.";
      if (primary === "kapha") return "Kapha stress is usually heaviness, lethargy, and emotional eating. Counteract with vigorous exercise, novelty, and skipping the next meal.";
      return "Stress responds best to slow, full breathing, daily movement, and an early dinner.";
    }
    if (/(diet|eat|food)/.test(t)) {
      if (!primary) return "Take a reading first; the diet plan is keyed to the result.";
      return DIET_PLAN[primary].principle + " The Diet tab has the full meal-by-meal plan.";
    }
    return "I am running in offline mode and cannot answer free-form questions. The Diet, Lifestyle, and History tabs have the bulk of the personalised material. Ask about constitution, breakfast, sleep, routine, stress, or food and I will respond with what I have.";
  }

  // Symptom analysis: simple keyword-to-dosha hypothesis.
  function analyseSymptoms() {
    const text = $("symptoms-input").value.toLowerCase();
    if (!text || text.length < 12) {
      $("symptoms-result").innerHTML = `<div class="empty"><h3>Tell me a little more</h3><p>A sentence or two with what you are feeling, when it happens, and how long it has been going on lets the analysis be useful.</p></div>`;
      return;
    }

    const map = {
      vata: ["dry", "anxious", "anxiety", "worry", "constipat", "insomnia", "racing", "cold hand", "joint crack", "irregular", "thin", "skin dry", "wind", "gas", "bloating"],
      pitta: ["burn", "irrita", "anger", "rash", "acid", "ulcer", "inflam", "heat", "sweat", "headache", "loose stool", "diarrh", "judge", "perfection", "thirst"],
      kapha: ["heavy", "lethar", "tired all", "weight gain", "congest", "phlegm", "sinus", "cold and clammy", "sleepy", "sluggish", "depress", "swell", "edema", "mucus", "slow"],
    };
    const scores = { vata: 0, pitta: 0, kapha: 0 };
    Object.entries(map).forEach(([d, kws]) => {
      kws.forEach((kw) => { if (text.includes(kw)) scores[d] += 1; });
    });

    const total = scores.vata + scores.pitta + scores.kapha || 1;
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    const interpretation = top[1] === 0
      ? "I could not match the description to a clear dosha pattern. Try again with more specific physical and mental sensations."
      : `The pattern leans toward a <strong>${top[0]}</strong> imbalance (${top[1]} markers identified). ${top[0] === "vata" ? "Common Vata-imbalance signs are dryness, anxiety, irregularity, and cold sensitivity. Counter with warm cooked food, sesame oil massage, and a fixed daily rhythm." : top[0] === "pitta" ? "Common Pitta-imbalance signs are heat, irritability, inflammation, and excess acidity. Counter with cooling food, midday rest, and avoiding hot weather extremes." : "Common Kapha-imbalance signs are heaviness, lethargy, mucus, and slow digestion. Counter with vigorous movement, light spiced food, and an early bedtime."}`;

    const breakdown = sorted.map(([d, v]) => `
      <li>
        <span style="font-family: var(--serif-display); font-style: italic; font-size: 1.1rem; text-transform: capitalize;">${escapeHTML(d)}</span>
        <span style="font-family: var(--mono); color: var(--ink-soft);">${v} marker${v === 1 ? "" : "s"}</span>
      </li>
    `).join("");

    $("symptoms-result").innerHTML = `
      <div class="rec-card" style="margin-top: 1.5rem;">
        <h4>Hypothesis</h4>
        <p style="color: var(--ink-soft); font-size: 1rem; line-height: 1.55;">${interpretation}</p>
        <ul class="pill-list" style="margin-top: 1.25rem;">${breakdown}</ul>
        <p style="margin-top: 1rem; font-family: var(--mono); font-size: 0.7rem; color: var(--ink-faint);">
          This is keyword-driven, not a clinical diagnosis. Treat it as a conversation starter with a qualified Ayurvedic practitioner.
        </p>
      </div>
    `;
  }

  function renderInsights() {
    const body = $("insights-body");
    if (!state.lastResult) {
      body.innerHTML = `<div class="empty"><h3>Insights need a reading</h3><p>The personalised insights below pull from your most recent reading. Take one to populate this tab.</p><button class="btn" data-jump="assessment">Begin the reading</button></div>`;
      bindJumpButtons(body);
      return;
    }
    const r = state.lastResult;
    const primary = r.constitution.split("+")[0];
    const secondary = r.constitution.split("+")[1];
    const insight = primary === "vata"
      ? "Your nervous system likely runs ahead of your body. Build buffer time around tasks, eat warm food, and treat sleep as the single non-negotiable item on your calendar."
      : primary === "pitta"
        ? "You probably do focused work better than most people, but the same intensity will burn through relationships if unchecked. Cool the body in the afternoon and refuse to argue when hungry."
        : "You hold steady where others swing. The risk is inertia. Make new habits painful enough to do, then easy: lay out running clothes the night before, skip breakfast, vary your route.";

    const tertiary = secondary
      ? `Your secondary dosha is ${secondary}. Where the routines for ${primary} and ${secondary} disagree, follow ${primary} most days and shift toward ${secondary} during the seasons that aggravate it (winter for Vata, summer for Pitta, spring for Kapha).`
      : `Your reading showed a clear single-dosha primary, which is unusual — most people land on dual constitutions. Re-take the reading after a meal change and see whether the result holds.`;

    body.innerHTML = `
      <article class="rec-card" style="max-width: 720px;">
        <h4>For your ${escapeHTML(primary)} primary</h4>
        <p style="color: var(--ink-soft); font-size: 1rem; line-height: 1.55;">${escapeHTML(insight)}</p>
      </article>
      <article class="rec-card" style="max-width: 720px; margin-top: 1.5rem;">
        <h4>On the secondary</h4>
        <p style="color: var(--ink-soft); font-size: 1rem; line-height: 1.55;">${escapeHTML(tertiary)}</p>
      </article>
      <article class="rec-card" style="max-width: 720px; margin-top: 1.5rem;">
        <h4>Confidence note</h4>
        <p style="color: var(--ink-soft); font-size: 1rem; line-height: 1.55;">The model reported <strong>${escapeHTML(r.confidence)}</strong> confidence on this reading. ${r.confidence === "high" ? "The signal across your answers was consistent — treat this result as a working hypothesis." : r.confidence === "medium" ? "The two top doshas were close. Take the reading again in a different season to see whether the balance shifts." : "The result was not a strong signal in any direction. Re-take the reading paying close attention to the questions on body frame, weather preferences, and reaction under pressure."}</p>
      </article>
    `;
    bindJumpButtons(body);
  }

  // ──────────────────────────────────────────────────────────────────
  // Wire-up
  // ──────────────────────────────────────────────────────────────────
  function init() {
    // Show classifier metadata
    if (window.PRAKRITI_MODEL_NAME && window.PRAKRITI_MODEL_METRICS) {
      const m = window.PRAKRITI_MODEL_METRICS;
      $("model-summary").textContent =
        window.PRAKRITI_MODEL_NAME + " · " +
        (m.accuracy_mean * 100).toFixed(1) + "% acc · macro-F1 " +
        m.f1_macro_mean.toFixed(2);
    } else {
      $("model-summary").textContent = "Classifier failed to load";
    }

    // Section nav
    $$(".nav-rail button").forEach((b) => {
      b.addEventListener("click", () => navigate(b.dataset.view));
    });

    // Begin button
    $("begin-btn").addEventListener("click", () => {
      state.currentQ = 0;
      state.answers = new Array(QUESTIONS.length).fill(null);
      navigate("assessment");
      renderQuestion();
    });

    // Assessment nav
    $("prev-btn").addEventListener("click", () => {
      if (state.currentQ > 0) { state.currentQ--; renderQuestion(); }
    });
    $("next-btn").addEventListener("click", async () => {
      if (state.answers[state.currentQ] == null) return;
      if (state.currentQ < QUESTIONS.length - 1) {
        state.currentQ++;
        renderQuestion();
      } else {
        await showResult();
      }
    });

    // Result actions
    $("restart-btn").addEventListener("click", () => {
      state.currentQ = 0;
      state.answers = new Array(QUESTIONS.length).fill(null);
      navigate("home");
    });
    $("copy-btn").addEventListener("click", async () => {
      if (!state.lastResult) return;
      const r = state.lastResult;
      const text = `Prakriti reading\nConstitution: ${r.constitution}\nVata ${r.percentages.vata}% · Pitta ${r.percentages.pitta}% · Kapha ${r.percentages.kapha}%\nConfidence: ${r.confidence}\nModel: ${window.PRAKRITI_MODEL_NAME || "—"}\n`;
      try {
        await navigator.clipboard.writeText(text);
        $("copy-btn").textContent = "Copied ✓";
        setTimeout(() => ($("copy-btn").textContent = "Copy result"), 1800);
      } catch { alert(text); }
    });

    // "Jump" buttons in result
    bindJumpButtons($("view-result"));

    // Restore last result if present
    if (state.store.history && state.store.history[0]) {
      state.lastResult = state.store.history[0];
      paintResult();
      // Surface "Result" tab in nav
      const t = document.querySelector('.nav-rail button[data-view="result"]');
      if (t) t.style.display = "";
    }

    // Keyboard shortcuts during assessment
    document.addEventListener("keydown", (e) => {
      if (state.currentView !== "assessment") return;
      if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (e.key >= "1" && e.key <= "3") {
        const idx = +e.key - 1;
        state.answers[state.currentQ] = idx;
        renderQuestion();
        $("next-btn").disabled = false;
      }
      if (e.key === "ArrowRight" && state.answers[state.currentQ] != null) $("next-btn").click();
      if (e.key === "ArrowLeft" && state.currentQ > 0) $("prev-btn").click();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
