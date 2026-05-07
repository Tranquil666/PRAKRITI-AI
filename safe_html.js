/**
 * Minimal helpers for safer DOM updates.
 *
 * setSafeHTML(el, html)   — sanitize with DOMPurify if available, else fall
 *                           back to textContent (so an attack payload renders
 *                           as inert text rather than executing).
 *
 * setText(el, text)       — explicit textContent set; use this for any
 *                           user-supplied string that does not need markup.
 *
 * escapeHTML(str)         — HTML-entity-encode a string for embedding inside
 *                           a template literal you intend to assign to
 *                           innerHTML. Prefer setText / setSafeHTML when you
 *                           can.
 */
(function () {
  const purify =
    typeof window !== "undefined" && typeof window.DOMPurify !== "undefined"
      ? window.DOMPurify
      : null;

  if (!purify && typeof console !== "undefined") {
    console.warn(
      "[safe-html] DOMPurify not loaded — falling back to textContent for any setSafeHTML calls."
    );
  }

  function setSafeHTML(el, html) {
    if (!el) return;
    if (purify) {
      el.innerHTML = purify.sanitize(html, { USE_PROFILES: { html: true } });
    } else {
      el.textContent = String(html);
    }
  }

  function setText(el, text) {
    if (!el) return;
    el.textContent = String(text);
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  if (typeof window !== "undefined") {
    window.setSafeHTML = setSafeHTML;
    window.setText = setText;
    window.escapeHTML = escapeHTML;
  }
})();
