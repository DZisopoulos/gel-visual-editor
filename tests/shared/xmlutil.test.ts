import { describe, it, expect } from 'vitest'
import {
  escapeXml,
  escapeAttr,
  fnv1a,
  encodeCommentJson,
  decodeCommentJson
} from '../../src/shared/xmlutil'

describe('xmlutil', () => {
  it('escapes element text', () => {
    expect(escapeXml('a < b && c > d')).toBe('a &lt; b &amp;&amp; c &gt; d')
  })
  it('escapes attribute values including quotes', () => {
    expect(escapeAttr('say "hi" & <go>')).toBe('say &quot;hi&quot; &amp; &lt;go&gt;')
  })
  it('encodes whitespace in attribute values so parsers cannot rewrite it', () => {
    expect(escapeAttr('A: 1\nB: 2')).toBe('A: 1&#10;B: 2')
    expect(escapeAttr('a\r\nb\tc')).toBe('a&#13;&#10;b&#9;c')
  })
  it('fnv1a is deterministic and 8 hex chars', () => {
    expect(fnv1a('hello')).toBe(fnv1a('hello'))
    expect(fnv1a('hello')).toMatch(/^[0-9a-f]{8}$/)
    expect(fnv1a('hello')).not.toBe(fnv1a('hellp'))
  })
  it('comment-safe JSON round-trips values containing --', () => {
    const v = { sql: 'SELECT 1 -- comment', note: '----' }
    const enc = encodeCommentJson(v)
    expect(enc).not.toContain('--')
    expect(decodeCommentJson(enc)).toEqual(v)
  })
})
