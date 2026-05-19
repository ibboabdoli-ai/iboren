"use client";

import { useEffect } from "react";

const replacements: Array<[RegExp, string]> = [
  [/CleanAI booking/g, "Iboren booking"],
  [/CleanAI draft/g, "Bokningsutkast"],
  [/CleanAI sammanfattar/g, "Iboren sammanfattar"],
  [/Smart städbokning med AI i Sverige/g, "Smart städbokning i Sverige"],
  [/\bAI\b/g, ""]
];

function cleanTextNode(node: Node) {
  if (!node.textContent) return;
  let next = node.textContent;
  for (const [pattern, replacement] of replacements) next = next.replace(pattern, replacement);
  next = next.replace(/\s{2,}/g, " ").trimStart();
  if (next !== node.textContent) node.textContent = next;
}

function cleanVisibleText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Node[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(cleanTextNode);
}

export default function TextCleanup() {
  useEffect(() => {
    cleanVisibleText();
    const observer = new MutationObserver(cleanVisibleText);
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
