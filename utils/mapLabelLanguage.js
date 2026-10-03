const languages = new Set(['en', 'ru', 'fr', 'de'])
export function mapLabelLocale(value) { return languages.has(value) ? value : 'en' }
const isName = value => typeof value === 'string' && /^(name(?::|_).+|name)$/.test(value)
function fields(expression, result = []) {
  if (!Array.isArray(expression)) return result
  if (['get', 'has'].includes(expression[0])) result.push(expression[1])
  else expression.forEach(item => fields(item, result))
  return result
}
const nonEmpty = field => ['case', ['==', ['get', field], ''], null, ['get', field]]
export function localizedNameExpression(locale, original) {
  const language = mapLabelLocale(locale)
  return ['coalesce', nonEmpty(`name:${language}`), nonEmpty(`name_${language}`),
    nonEmpty('name'), nonEmpty('name:latin'), original]
}
// Replace provider name expressions, retaining road refs, elevation and formatting.
// Original expressions are always reused as the final provider-default fallback.
export function localizeMapText(expression, locale) {
  if (!Array.isArray(expression)) return expression
  const reads = fields(expression)
  if (reads.length && reads.every(isName)) return localizedNameExpression(locale, expression)
  return expression.map(item => Array.isArray(item) ? localizeMapText(item, locale) : item)
}
export function applyMapLabelLanguage(renderer, originals, locale) {
  for (const [id, original] of originals) {
    const localized = localizeMapText(original, locale)
    if (JSON.stringify(original) !== JSON.stringify(localized)) renderer.setLayoutProperty(id, 'text-field', localized)
  }
}
