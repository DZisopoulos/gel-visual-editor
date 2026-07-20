export function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
export function escapeAttr(text: string): string {
  return escapeXml(text).replace(/"/g, '&quot;')
}
export function fnv1a(text: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
export function encodeCommentJson(value: unknown): string {
  return JSON.stringify(value, null, 1).replace(/--/g, '-\\u002d')
}
export function decodeCommentJson(text: string): unknown {
  return JSON.parse(text)
}
