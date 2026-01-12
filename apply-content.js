// Content loader (design locked, content editable)
// - Edit site-content.json only.
// - Do not change CSS tokens or layout classes in index.html.

async function loadContent() {
  try {
    const res = await fetch('./site-content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load site-content.json: ${res.status}`);
    const data = await res.json();

    // Plain text injections
    const text = data.text || {};
    document.querySelectorAll('[data-content]').forEach((el) => {
      const key = el.getAttribute('data-content');
      if (key && Object.prototype.hasOwnProperty.call(text, key)) {
        el.textContent = text[key];
      }
    });

    // HTML injections (use sparingly; trusted content only)
    const html = data.html || {};
    document.querySelectorAll('[data-html]').forEach((el) => {
      const key = el.getAttribute('data-html');
      if (key && Object.prototype.hasOwnProperty.call(html, key)) {
        el.innerHTML = html[key];
      }
    });
  } catch (err) {
    console.warn('Content load skipped:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadContent);
