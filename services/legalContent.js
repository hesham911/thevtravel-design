import DOMPurify from 'isomorphic-dompurify'
import { parseHTML } from 'linkedom'
// Rich-editor data is content, never executable markup or a second theme system.
export function sanitizeLegalHTML(value, tableLabel = 'Table') {
  if (typeof value !== 'string') return ''
  const clean = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','hr','ul','ol','li','a','strong','b','em','i','u','s','blockquote','pre','code','div','span','table','caption','thead','tbody','tfoot','tr','th','td'],
    ALLOWED_ATTR: ['href','title','colspan','rowspan','scope','start','reversed','lang'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  })
  const document = parseHTML('<html><body></body></html>').document
  const template = document.createElement('div')
  template.innerHTML = clean
  template.querySelectorAll('table').forEach(table => {
    const wrapper = document.createElement('div')
    wrapper.className = 'legal-table-scroll'
    wrapper.setAttribute('role', 'region')
    wrapper.setAttribute('aria-label', table.querySelector('caption')?.textContent || tableLabel)
    wrapper.setAttribute('tabindex', '0')
    table.replaceWith(wrapper)
    wrapper.append(table)
  })
  return template.innerHTML
}
export function localizedLegalHTML(record, language) {
  return typeof record?.html === 'string' ? record.html : record?.html?.[language] || record?.html?.en || ''
}
