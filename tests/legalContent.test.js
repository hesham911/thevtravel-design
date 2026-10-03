import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeLegalHTML, localizedLegalHTML } from '../services/legalContent.js'
test('server legal sanitization retains rich text, blocks executable markup, and wraps tables', () => {
  const clean = sanitizeLegalHTML('<h2>Policy</h2><p onclick="alert(1)" style="color:red">Text <strong>bold</strong><a href="javascript:alert(1)">link</a></p><script>alert(1)</script><iframe src="https://evil.test"></iframe><table><caption>Prices</caption><tr><td>USD 120</td></tr></table>')
  assert.match(clean, /<h2>Policy<\/h2>/)
  assert.match(clean, /<strong>bold<\/strong>/)
  assert.doesNotMatch(clean, /onclick|javascript:|<script|<iframe|style=/)
  assert.match(clean, /class="legal-table-scroll"/)
  assert.match(clean, /aria-label="Prices"/)
  assert.match(clean, /tabindex="0"/)
})
test('legal localization preserves supplied content and English fallback', () => {
  assert.equal(localizedLegalHTML({html:{en:'English',fr:'French'}},'fr'),'French')
  assert.equal(localizedLegalHTML({html:{en:'English'}},'ru'),'English')
  assert.equal(sanitizeLegalHTML(null),'')
})
