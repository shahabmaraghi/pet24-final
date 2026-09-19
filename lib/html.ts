export function htmlPlainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function paragraphsToHtml(paragraphs: string[]) {
  return paragraphs
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.startsWith("<") ? item : `<p>${escapeHtml(item)}</p>`))
    .join("");
}

export function htmlToParagraphs(html: string) {
  const text = htmlPlainText(html);
  if (!text && !/<img[\s>/]/i.test(html) && !/<figure[\s>]/i.test(html)) return [];
  return [html];
}

export function postBodyFromDoc(doc: { content?: unknown; body?: unknown; paragraphs?: unknown }) {
  const content = typeof doc.content === "string" ? doc.content.trim() : "";
  if (content) return content;
  const body = typeof doc.body === "string" ? doc.body.trim() : "";
  if (body) return body;
  const paragraphs = Array.isArray(doc.paragraphs) ? doc.paragraphs.map(String) : [];
  if (paragraphs.some((item) => /<[a-z][\s\S]*>/i.test(item))) return paragraphs.join("");
  return paragraphsToHtml(paragraphs);
}

export function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

