import { computed } from 'vue'
import { useAsyncData, useRuntimeConfig } from '#imports'
import { useI18n } from '~/utils/i18n'
import { fetchPageSections, itemsOr, linesOf, textOr } from '~/services/pageContent'

/**
 * The navigation target that opens the transfer request panel instead of
 * navigating. A nav row carrying it is drawn as a button.
 *
 * The admin's help text names this value, and SiteHeader is the only place
 * that acts on it, so the CMS and the header cannot disagree about which row
 * is the transfer entry point.
 */
export const TRANSFER_TARGET = '#transfer'

/**
 * The navigation the site ships with — the fallback while the CMS has none,
 * and the copy the admin's rows were seeded from. Titles are i18n keys.
 */
const FALLBACK_NAV = [
  { key: 'journeys', title: 'Journeys', link: '/journeys' },
  { key: 'transfers', title: 'Private Transfers', link: TRANSFER_TARGET },
  { key: 'how-booking-works', title: 'How booking works', link: '/how-booking-works' },
  { key: 'faq', title: 'FAQ', link: '/faq' },
  { key: 'about', title: 'About us', link: '/about' },
  { key: 'contact', title: 'Contact us', link: '/contact' },
]

// The header and footer every page draws, managed in the admin under
// Website Content → Header & Footer.
//
// One request for the whole chrome: the API serves the `shared` page's
// sections with the logos, the addresses and the social links from Settings
// merged into them, so the header, its navigation labels, the site-wide
// button words, the footer and the floating buttons read from a single
// payload instead of five. Every component that needs it
// calls this composable, and Nuxt's own request deduplication means they
// share one fetch per page.
//
// Every value falls back to the copy the components ship with, so the site
// is unchanged when no API base URL is configured, when the API is
// unreachable, or when a field has been cleared in the admin.
export function useSiteContent() {
  const { locale, translate } = useI18n()
  const { public: runtime } = useRuntimeConfig()

  const { data: sections } = useAsyncData(
    'site-chrome',
    () => fetchPageSections(runtime.apiBaseUrl, 'shared', locale.value),
    { watch: [locale], default: () => null },
  )

  const header = computed(() => {
    const section = sections.value?.header
    return {
      logoAlt: textOr(section?.data?.logo_alt, translate('TheVTravel')),
      logoLight: section?.data?.logo_light_url || null,
      logoDark: section?.data?.logo_dark_url || null,
      ctaText: textOr(section?.data?.cta_text, translate('Explore journeys')),
    }
  })

  // The navigation's words, in the order the admin arranged them. Labels and
  // targets, not a menu builder: the routes are the application's own and a
  // row points at one of them. One row is a button rather than a link — the
  // transfer target below — which is why the header renders the two
  // differently rather than assuming every row navigates.
  //
  // The built-in navigation is the fallback, so the header is unchanged while
  // no API is configured, while the API is unreachable, and if every row were
  // unpublished.
  const nav = computed(() => {
    const rows = itemsOr(sections.value?.header_nav, null)

    if (!rows) {
      return FALLBACK_NAV.map(item => ({ ...item, title: translate(item.title) }))
    }

    return rows
      .filter(row => row.title)
      .map(row => ({ key: row.key, title: row.title, link: row.link }))
  })

  // The buttons the site draws outside any one page: the transfer entry
  // point that floats on every page, and the WhatsApp button beside it. The
  // WhatsApp address itself is a Settings row — see whatsappUrl.
  const buttons = computed(() => {
    const data = sections.value?.site_buttons?.data ?? {}
    return {
      transfer: textOr(data.transfer_cta, translate('Request a transfer')),
      whatsapp: textOr(data.whatsapp_cta, translate('Chat on WhatsApp')),
    }
  })

  const footer = computed(() => {
    const section = sections.value?.footer_brand
    return {
      logoAlt: header.value.logoAlt,
      logoLight: section?.data?.logo_light_url || null,
      logoDark: section?.data?.logo_dark_url || null,
      taglineLines: linesOf(section?.body, [
        translate('Private journeys across Egypt,'),
        translate('at your own pace.'),
      ]),
      copyright: textOr(section?.data?.copyright, translate('TheVTravel. All rights reserved.')),
      paymentNote: textOr(section?.data?.payment_note, translate('No online payment. No deposit.')),
      bookingNote: textOr(section?.data?.booking_note, translate('No online payment. Need to confirm your booking.')),
      replyNote: textOr(section?.data?.reply_note, translate('We reply by message, every day.')),
    }
  })

  // The addresses and links the footer and the Contact page show. Null, not
  // a guess: a button whose address has not been configured stays disabled
  // rather than pointing somewhere wrong.
  //
  // Phone numbers are deliberately absent: no part of the site ever rendered
  // them, and the settings behind them were retired with the CMS's Contact
  // Info tab, so the API no longer sends them.
  const contact = computed(() => {
    const data = sections.value?.footer_brand?.data ?? {}
    const social = Array.isArray(data.social_media) ? data.social_media : []
    return {
      email: data.email || null,
      supportEmail: data.support_email || null,
      social: Object.fromEntries(social.map(entry => [entry.platform, entry.url])),
    }
  })

  // The WhatsApp link lives in one place — Settings → Social — and the
  // runtime config stays a fallback for a deployment that has no API yet.
  const whatsappUrl = computed(() => contact.value.social.whatsapp || runtime.whatsappUrl || '')

  /**
   * One footer column: its heading and its links, read inside the caller's
   * own computed so it stays reactive to the language and to the fetch.
   *
   * The Journeys column also carries the destinations the API resolved from
   * Destination records. They belong between the column's first link ("All
   * journeys") and the rest of it, which is where the design puts them.
   */
  function column(key, fallback) {
    const section = sections.value?.[key]
    const links = itemsOr(section, null)
    const title = textOr(section?.title, translate(fallback.title))

    if (!links) {
      return { key, title, links: fallback.links.map(link => ({ ...link, title: translate(link.title) })) }
    }

    const destinations = (section?.data?.destinations ?? []).map(destination => ({
      key: destination.slug,
      title: destination.name,
      link: destination.journeys_path,
    }))

    return {
      key,
      title,
      links: destinations.length ? [links[0], ...destinations, ...links.slice(1)] : links,
    }
  }

  return { header, nav, buttons, footer, contact, whatsappUrl, column }
}
