// The pages' own copy, used only while the CMS has nothing to serve: no API
// base URL configured, the API unreachable, or the page unpublished.
//
// The body is deliberately empty. No approved privacy policy or terms have
// been supplied for TheVTravel, and legal clauses are not drafted here — the
// page renders its "Content is being prepared." state until approved copy is
// pasted into the admin's editor (Website Content → Privacy Policy / Terms
// & Conditions), in each of the five languages.
export const legalPages = {
  privacy: { title: 'Privacy Policy', html: { en: '', fr: '', de: '', ru: '', zh: '' }, intro: null, updatedAt: null },
  terms: { title: 'Terms & Conditions', html: { en: '', fr: '', de: '', ru: '', zh: '' }, intro: null, updatedAt: null },
}
