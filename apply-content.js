// Soil Genesis content loader
// Visible copy is stored in site-content.json under "text" and "html".
// The inline HTML copy remains as a safe fallback if the JSON cannot load.

(function () {
  'use strict';

  function setMeta(name, value, property) {
    if (!value) return;
    const selector = property
      ? `meta[property="${property}"]`
      : `meta[name="${name}"]`;
    let tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      if (property) tag.setAttribute('property', property);
      else tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', value);
  }

  async function loadContent() {
    try {
      const response = await fetch('./site-content.json', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load site-content.json: ${response.status}`);
      }

      const data = await response.json();
      const text = data.text || {};
      const html = data.html || {};
      const missing = [];

      document.querySelectorAll('[data-content]').forEach(function (element) {
        const key = element.getAttribute('data-content');
        if (!key) return;
        if (Object.prototype.hasOwnProperty.call(text, key)) {
          element.textContent = text[key];
        } else {
          missing.push(`text:${key}`);
        }
      });

      document.querySelectorAll('[data-html]').forEach(function (element) {
        const key = element.getAttribute('data-html');
        if (!key) return;
        if (Object.prototype.hasOwnProperty.call(html, key)) {
          element.innerHTML = html[key];
        } else {
          missing.push(`html:${key}`);
        }
      });

      const meta = data.meta || {};
      if (meta.title) document.title = meta.title;
      setMeta('description', meta.description);
      setMeta(null, meta.og_title, 'og:title');
      setMeta(null, meta.og_description, 'og:description');

      if (missing.length) {
        console.warn('Content keys missing from site-content.json:', missing);
      }

      document.dispatchEvent(new CustomEvent('soilgenesis:content-loaded', {
        detail: { missingKeys: missing }
      }));
    } catch (error) {
      console.warn('Content load skipped; inline fallback copy remains active:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent, { once: true });
  } else {
    loadContent();
  }
}());
