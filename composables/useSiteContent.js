import { computed } from 'vue'
import { useAsyncData, useRuntimeConfig } from '#imports'
import { useI18n } from '~/utils/i18n'
import { fetchPageSections, itemsOr, linesOf, textOr } from '~/services/pageContent'

// The header and footer every page draws, managed in the admin under
// Website Content → Header & Footer.
//
// One request for the whole chrome: the API serves the `shared` page's
// sections with the logos, the addresses and the social links from Settings
// merged into them, so the header, the footer and the floating buttons read
// from a single payload instead of three. Every component that needs it
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
  const contact = computed(() => {
    const data = sections.value?.footer_brand?.data ?? {}
    const social = Array.isArray(data.social_media) ? data.social_media : []
    return {
      email: data.email || null,
      supportEmail: data.support_email || null,
      phones: Array.isArray(data.phones) ? data.phones : [],
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

  return { header, footer, contact, whatsappUrl, column }
}
