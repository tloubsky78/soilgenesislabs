#!/usr/bin/env node

import fs from "node:fs";

const jsonPath = process.argv[2] || "site-content.json";
const htmlPath = process.argv[3] || "index.html";

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

if (!fs.existsSync(jsonPath)) fail(`Cannot find ${jsonPath}`);
if (!fs.existsSync(htmlPath)) fail(`Cannot find ${htmlPath}`);

let content;

try {
  content = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
} catch (error) {
  fail(`Could not parse ${jsonPath}: ${error.message}`);
}

const textEntries = Object.entries(content.text || {});
const htmlEntries = Object.entries(content.html || {});

let html = fs.readFileSync(htmlPath, "utf8");
let changed = 0;

function replaceInner(key, value, attributeName) {
  const escapedKey = escapeRegExp(key);

  const pattern = new RegExp(
    `(<([A-Za-z][A-Za-z0-9:-]*)\\b[^>]*\\b${attributeName}=["']${escapedKey}["'][^>]*>)([\\s\\S]*?)(<\\/\\2\\s*>)`,
    "g"
  );

  const matches = [...html.matchAll(pattern)];

  if (matches.length === 0) {
    fail(
      `Key "${key}" was not found in ${htmlPath} as ${attributeName}.`
    );
  }

  if (matches.length > 1) {
    fail(
      `Key "${key}" occurs ${matches.length} times in ${htmlPath}; refusing to guess.`
    );
  }

  html = html.replace(
    pattern,
    (_full, openTag, _tagName, oldValue, closeTag) => {
      if (oldValue !== value) changed += 1;
      return `${openTag}${value}${closeTag}`;
    }
  );
}

for (const [key, value] of textEntries) {
  if (typeof value !== "string") {
    fail(`text.${key} is not a string`);
  }

  replaceInner(key, value, "data-content");
}

for (const [key, value] of htmlEntries) {
  if (typeof value !== "string") {
    fail(`html.${key} is not a string`);
  }

  replaceInner(key, value, "data-html");
}

fs.writeFileSync(htmlPath, html, "utf8");

console.log(`Synchronized ${htmlPath}`);
console.log(`Changed fallback fields: ${changed}`);
console.log(`Checked text keys: ${textEntries.length}`);
console.log(`Checked HTML keys: ${htmlEntries.length}`);
