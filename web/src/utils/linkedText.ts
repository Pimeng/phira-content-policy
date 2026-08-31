export interface LinkedTextSegment {
  text: string;
  href?: string;
}

const INLINE_HTTP_LINK = /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;

/**
 * Parse the small, deliberately limited link syntax supported by policy notes.
 * Vue still renders every label as text, so policy data can never inject HTML.
 */
export function parseLinkedText(text: string): LinkedTextSegment[] {
  const segments: LinkedTextSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE_HTTP_LINK)) {
    const index = match.index;
    const source = match[0];
    const label = match[1];
    const href = match[2];
    if (index === undefined || !source || !label || !href) continue;

    if (index > cursor) segments.push({ text: text.slice(cursor, index) });
    segments.push({ text: label, href });
    cursor = index + source.length;
  }

  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

export function linkedTextToPlainText(text: string): string {
  return parseLinkedText(text)
    .map((segment) => segment.text)
    .join("");
}
