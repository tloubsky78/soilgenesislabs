// Soil Genesis content loader
// The page retains complete fallback copy in index.html.
// site-content.json may update metadata, trusted HTML fragments, and plain text.
async function loadContent() {
  try {
    const res = await fetch('./site-content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load site-content.json: ${res.status}`);
    const data = await res.json();

    const meta = data.meta || {};
    if (meta.title) document.title = meta.title;
    const setMeta = (selector, value) => {
      if (!value) return;
      const node = document.querySelector(selector);
      if (node) node.setAttribute('content', value);
    };
    setMeta('meta[name="description"]', meta.description);
    setMeta('meta[property="og:title"]', meta.og_title);
    setMeta('meta[property="og:description"]', meta.og_description);

    const html = data.html || {};
    document.querySelectorAll('[data-html]').forEach((el) => {
      const key = el.getAttribute('data-html');
      if (key && Object.prototype.hasOwnProperty.call(html, key)) {
        el.innerHTML = html[key];
      }
    });

    const text = data.text || {};
    document.querySelectorAll('[data-content]').forEach((el) => {
      const key = el.getAttribute('data-content');
      if (key && Object.prototype.hasOwnProperty.call(text, key)) {
        el.textContent = text[key];
      }
    });
  } catch (err) {
    console.warn('Content load skipped; using inline fallback copy:', err);
  }
}
document.addEventListener('DOMContentLoaded', loadContent);
