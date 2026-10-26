<script setup>
import { computed, reactive, ref, defineAsyncComponent } from 'vue'
import { useAsyncData, useRoute, useRuntimeConfig } from '#imports'
definePageMeta({ name: 'contact', title: 'Contact Us — TheVTravel' })
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import { useI18n } from '~/utils/i18n'
import { useSiteContent } from '~/composables/useSiteContent'
import { fetchPageSections, itemsOr, linesOf, textOr } from '~/services/pageContent'
import { FIELD_LIMITS, submitContactMessage } from '~/services/contact'
const ServiceAreaMap = defineAsyncComponent(() => import('~/components/ServiceAreaMap.vue'))

const { locale, translate } = useI18n()
const { public: runtime } = useRuntimeConfig()
const { whatsappUrl } = useSiteContent()

// Managed in the admin under Website Content → Contact Us. The form's own
// field labels, validation messages and send states are interface text and
// stay here: none of them is content an admin writes.
const { data: sections } = await useAsyncData(
  'contact-sections',
  () => fetchPageSections(runtime.apiBaseUrl, 'contact-us', locale.value),
  { watch: [locale], default: () => null },
)

const route = useRoute()
const requestedJourney = typeof route.query.journey === 'string' ? route.query.journey : ''
const form = reactive({ name: '', email: '', whatsapp: '', subject: requestedJourney ? (route.query.subject === 'question' ? 'General question' : 'Journey request') : '', message: requestedJourney ? `I’m interested in ${requestedJourney}. ` : '', consent: false })
const errors = reactive({})
const status = ref('')
// One request at a time: the button is disabled while it is in flight and the
// handler returns early, so a double click or a second Enter cannot send the
// same message twice.
const pending = ref(false)
const openFaq = ref(null)

// The page's own copy, used only while the CMS has nothing to serve.
const fallback = {
  methods: [
    { key: 'whatsapp', icon: 'whatsapp', title: 'Message us on WhatsApp', description: 'Our preferred way to connect.\nQuick, simple and personal.', label: 'Open WhatsApp', link: '' },
    { key: 'email', icon: 'mail', title: 'Email us', description: 'Send us your questions or ideas.\nWe\'ll get back to you soon.', label: 'hello@thevtravel.com', link: 'mailto:hello@thevtravel.com' },
    { key: 'support', icon: 'headset', title: 'Booking support', description: 'Need help with an existing booking?\nWe\'re here to help.', label: 'support@thevtravel.com', link: 'mailto:support@thevtravel.com' },
  ],
  paths: [
    { key: 'journey', icon: 'compass', title: 'Journey request', description: 'Planning a private journey, day tour or custom itinerary.', label: 'Send your request', link: '#contact-form' },
    { key: 'transfer', icon: 'car', title: 'Transfer request', description: 'Airport transfers, city to city or private car with driver.', label: 'Request a transfer', link: '#contact-form' },
    { key: 'booking', icon: 'ticket', title: 'Existing booking help', description: 'Changes, questions or support with your current booking.', label: 'Get support', link: 'mailto:support@thevtravel.com' },
  ],
  faqs: [
    { key: 'reply', title: 'How do I get a reply?', description: 'Send the form or email us. A real member of the team will reply personally.' },
    { key: 'custom', title: 'Can you help me plan a custom itinerary?', description: 'Yes. Tell us your dates, interests and preferred pace and we’ll help shape the right private journey.' },
    { key: 'transfers', title: 'Can you arrange airport transfers?', description: 'Yes. We can arrange private airport and city-to-city transfers.' },
    { key: 'existing', title: 'Do you support existing bookings?', description: 'Yes. Email support@thevtravel.com with your booking details and the change or question.' },
    { key: 'payment', title: 'Is online payment available?', description: 'No. Payment details are confirmed personally after your request has been reviewed.' },
  ],
}

function fallbackCards(cards) {
  return cards.map(card => ({
    key: card.key,
    icon: card.icon ?? null,
    title: translate(card.title),
    description: translate(card.description),
    label: card.label ? translate(card.label) : '',
    link: card.link ?? '',
  }))
}

const hero = computed(() => {
  const section = sections.value?.hero
  return {
    eyebrow: textOr(section?.subtitle, translate("We're here for you")),
    title: textOr(section?.title, translate('Let’s plan the journey together.')),
    lines: linesOf(section?.body, [
      translate('Have a question or ready to plan your trip?'),
      translate('Reach out anytime—real people, real replies.'),
    ]),
    replyNote: textOr(section?.data?.reply_note, translate('We reply by message, every day.')),
    photoAlt: textOr(section?.data?.image_alt, translate('A felucca sailing on the Nile at sunset')),
    image: section?.media?.image?.url || null,
  }
})

const heroPhotoStyle = computed(() => hero.value.image ? { '--hero-image': `url(${JSON.stringify(hero.value.image)})` } : null)

// The WhatsApp channel's own link is deliberately empty in the CMS: the
// address lives in Settings → Social, so the card reads it from there and
// stays disabled while it is unset.
const methods = computed(() => {
  const section = sections.value?.methods
  return {
    eyebrow: textOr(section?.subtitle, translate('Get in touch')),
    reassuranceLines: linesOf(section?.body, [
      translate('Share your ideas and we’ll take care of the rest,'),
      translate('with clear replies and local insight.'),
    ]),
    cards: itemsOr(section, fallbackCards(fallback.methods)).map(card => ({
      ...card,
      href: card.icon === 'whatsapp' ? (card.link || whatsappUrl.value) : card.link,
    })),
  }
})

const formCopy = computed(() => {
  const section = sections.value?.form
  return {
    eyebrow: textOr(section?.subtitle, translate('Send us a message')),
    replyNote: textOr(section?.body, translate('We reply by message, every day.')),
  }
})

const paths = computed(() => {
  const section = sections.value?.paths
  return {
    eyebrow: textOr(section?.subtitle, translate('Choose the right path')),
    title: textOr(section?.title, translate('What can we help you with?')),
    cards: itemsOr(section, fallbackCards(fallback.paths)),
  }
})

const serviceArea = computed(() => {
  const section = sections.value?.service_area
  return {
    eyebrow: textOr(section?.subtitle, translate('Where we help')),
    title: textOr(section?.title, translate('Our service area')),
    body: textOr(section?.body, translate('We create private journeys and transfers across Egypt.')),
    lines: linesOf(section?.sub_body, [
      translate('From Cairo and the Nile Valley to Luxor, Aswan,'),
      translate('the Red Sea and beyond.'),
    ]),
    label: textOr(section?.data?.cta_text, translate('Explore journeys')),
    link: textOr(section?.data?.cta_url, '/journeys'),
  }
})

const faq = computed(() => {
  const section = sections.value?.faq
  return {
    eyebrow: textOr(section?.subtitle, translate('Contact FAQ')),
    title: textOr(section?.title, translate('Common questions')),
    questions: itemsOr(section, fallbackCards(fallback.faqs)),
  }
})

const cta = computed(() => {
  const section = sections.value?.cta
  return {
    title: textOr(section?.title, translate('Ready to plan your Egypt journey?')),
    body: textOr(section?.body, translate("Share your ideas and we'll create a journey that feels just right.")),
    label: textOr(section?.data?.cta_text, translate('Send your request')),
    link: textOr(section?.data?.cta_url, '#contact-form'),
    photoAlt: textOr(section?.data?.image_alt, translate('A felucca sailing the Nile at sunset')),
  }
})

// The message the form shows beside a field the API rejected. The API's own
// messages arrive in English for every language but English — it carries
// validation lines for en and ar only — so a rejection it reports is worded
// here, in the visitor's language, from the same sentences the form's own
// checks use. The form mirrors every rule the API has, so this is the net
// under a rule it cannot check, not the ordinary path.
const serverFieldMessages = {
  name: 'Please enter your full name.',
  email: 'Please enter a valid email address.',
  whatsapp: 'Please check your WhatsApp number.',
  subject: 'Please choose a subject.',
  message: 'Please tell us how we can help.',
}

function tooLong(max) {
  return translate('Please use {max} characters or fewer.', { max })
}

// The API's rules, checked here so a visitor reads them in their own
// language before anything is sent. `consent` is the form's own gate and the
// API neither receives nor knows about it.
function validate() {
  Object.keys(errors).forEach((key) => delete errors[key])
  if (!form.name.trim()) errors.name = 'Please enter your full name.'
  else if (form.name.trim().length > FIELD_LIMITS.name) errors.name = tooLong(FIELD_LIMITS.name)
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Please enter a valid email address.'
  else if (form.email.trim().length > FIELD_LIMITS.email) errors.email = tooLong(FIELD_LIMITS.email)
  if (form.whatsapp.trim().length > FIELD_LIMITS.whatsapp) errors.whatsapp = tooLong(FIELD_LIMITS.whatsapp)
  if (!form.subject) errors.subject = 'Please choose a subject.'
  else if (form.subject.trim().length > FIELD_LIMITS.subject) errors.subject = tooLong(FIELD_LIMITS.subject)
  if (!form.message.trim()) errors.message = 'Please tell us how we can help.'
  else if (form.message.trim().length > FIELD_LIMITS.message) errors.message = tooLong(FIELD_LIMITS.message)
  if (!form.consent) errors.consent = 'Please agree before sending your message.'
  return Object.keys(errors).length === 0
}

function focusFirstError() {
  requestAnimationFrame(() => document.querySelector('.contact-field.has-error input, .contact-field.has-error select, .contact-field.has-error textarea')?.focus())
}

async function submitForm() {
  if (pending.value) return
  status.value = ''
  if (!validate()) {
    status.value = 'Please review the highlighted fields.'
    focusFirstError()
    return
  }

  pending.value = true
  try {
    const result = await submitContactMessage(runtime.apiBaseUrl, form, locale.value)

    // Only a stored message clears the form. Every other outcome keeps what
    // the visitor typed, so a retry costs them nothing.
    if (result.status === 'ok') {
      Object.assign(form, { name: '', email: '', whatsapp: '', subject: '', message: '', consent: false })
      status.value = 'Thank you — your message has been sent. We’ll reply soon.'
      return
    }

    if (result.status === 'invalid') {
      Object.keys(errors).forEach((key) => delete errors[key])
      for (const field of Object.keys(result.errors)) errors[field] = serverFieldMessages[field] || result.errors[field]
      // A rejection naming nothing this form shows would leave the visitor
      // reading about fields that are not highlighted.
      status.value = Object.keys(errors).length ? 'Please review the highlighted fields.' : 'We couldn’t send your message. Please try again, or email hello@thevtravel.com.'
      focusFirstError()
      return
    }

    // Unreachable, failing, or not configured at all: never a thank you.
    status.value = result.status === 'demo'
      ? 'Sending is not available right now. Please email hello@thevtravel.com.'
      : 'We couldn’t send your message. Please try again, or email hello@thevtravel.com.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="contact-page">
    <SiteHeader />

    <main>
      <section class="contact-hero" aria-labelledby="contact-title">
        <div class="contact-hero-copy">
          <p class="eyebrow">{{ hero.eyebrow }}</p>
          <h1 id="contact-title">{{ hero.title }}</h1>
          <span class="heading-rule" aria-hidden="true"></span>
          <p><template v-for="(line, index) in hero.lines" :key="index"><br v-if="index" />{{ line }}</template></p>
          <div class="reply-note"><span><AppIcon name="person" :size="26" /></span>{{ hero.replyNote }}</div>
        </div>
        <div class="contact-hero-photo" role="img" :aria-label="hero.photoAlt" :style="heroPhotoStyle"></div>
        <svg class="contact-route" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true">
          <path d="M265 594c38-79 120-53 211-55 80-2 115 1 153-55 23-34 40-44 82-40" />
          <circle cx="629" cy="484" r="6" />
        </svg>
      </section>

      <section class="contact-main page-container" :aria-label='$t("Contact TheVTravel")'>
        <div class="contact-methods">
          <p class="eyebrow">{{ methods.eyebrow }}</p>
          <article
            v-for="(method, index) in methods.cards"
            :key="method.key"
            class="contact-method"
            :class="{ 'contact-method--featured': index === 0 }"
          >
            <span class="method-icon" :class="{ 'whatsapp-icon': method.icon === 'whatsapp' }"><AppIcon :name="method.icon || 'mail'" :size="index === 0 ? 36 : 31" /></span>
            <div>
              <h2>{{ method.title }}</h2>
              <p><template v-for="(line, lineIndex) in method.description.split('\n')" :key="lineIndex"><br v-if="lineIndex" />{{ line }}</template></p>
              <a v-if="method.href" :href="method.href" :target="method.icon === 'whatsapp' ? '_blank' : undefined" :rel="method.icon === 'whatsapp' ? 'noopener noreferrer' : undefined">{{ method.label }} <AppIcon name="chevron-right" :size="14" /></a>
              <template v-else>
                <button type="button" disabled :aria-describedby="`method-unavailable-${method.key}`">{{ method.label }} <AppIcon name="chevron-right" :size="14" /></button>
                <small :id="`method-unavailable-${method.key}`" class="method-note">{{ $t("Contact link not configured yet.") }}</small>
              </template>
            </div>
          </article>
          <aside class="contact-reassurance"><AppIcon name="shield" :size="34" /><p><template v-for="(line, index) in methods.reassuranceLines" :key="index"><br v-if="index" />{{ line }}</template></p></aside>
        </div>

        <form id="contact-form" class="contact-form" novalidate @submit.prevent="submitForm">
          <p class="eyebrow">{{ formCopy.eyebrow }}</p>
          <div class="form-grid">
            <div class="contact-field" :class="{ 'has-error': errors.name }"><label for="contact-name">{{ $t("Full name") }}</label><input id="contact-name" v-model="form.name" name="name" autocomplete="name" :aria-invalid="!!errors.name" :aria-describedby="errors.name ? 'name-error' : undefined" /><small v-if="errors.name" id="name-error">{{ $t(errors.name) }}</small></div>
            <div class="contact-field" :class="{ 'has-error': errors.email }"><label for="contact-email">{{ $t("Email address") }}</label><input id="contact-email" v-model="form.email" name="email" type="email" autocomplete="email" :aria-invalid="!!errors.email" :aria-describedby="errors.email ? 'email-error' : undefined" /><small v-if="errors.email" id="email-error">{{ $t(errors.email) }}</small></div>
            <div class="contact-field full" :class="{ 'has-error': errors.whatsapp }"><label for="contact-whatsapp">{{ $t("WhatsApp number (with country code)") }}</label><input id="contact-whatsapp" v-model="form.whatsapp" name="whatsapp" type="tel" autocomplete="tel" :placeholder='$t("e.g. +20 10 1234 5678")' :aria-invalid="!!errors.whatsapp" :aria-describedby="errors.whatsapp ? 'whatsapp-error' : undefined" /><small v-if="errors.whatsapp" id="whatsapp-error">{{ $t(errors.whatsapp) }}</small></div>
            <div class="contact-field full" :class="{ 'has-error': errors.subject }"><label for="contact-subject">{{ $t("Subject") }}</label><select id="contact-subject" v-model="form.subject" name="subject" :aria-invalid="!!errors.subject" :aria-describedby="errors.subject ? 'subject-error' : undefined"><option value="" disabled>{{ $t("Choose a subject") }}</option><option value="Journey request">{{ $t("Journey request") }}</option><option value="Private transfer">{{ $t("Private transfer") }}</option><option value="Existing booking">{{ $t("Existing booking") }}</option><option value="General question">{{ $t("General question") }}</option><option value="Other">{{ $t("Other") }}</option></select><small v-if="errors.subject" id="subject-error">{{ $t(errors.subject) }}</small></div>
            <div class="contact-field full" :class="{ 'has-error': errors.message }"><label for="contact-message">{{ $t("Message") }}</label><textarea id="contact-message" v-model="form.message" name="message" rows="5" :placeholder='$t("Tell us about your plans, questions or anything else...")' :aria-invalid="!!errors.message" :aria-describedby="errors.message ? 'message-error' : undefined"></textarea><small v-if="errors.message" id="message-error">{{ $t(errors.message) }}</small></div>
          </div>
          <label class="consent" :class="{ 'has-error': errors.consent }"><input v-model="form.consent" type="checkbox" :aria-invalid="!!errors.consent" :aria-describedby="errors.consent ? 'consent-error' : undefined" /> <span>{{ $t("I agree to the") }} <NuxtLink class="privacy-term" to="/privacy-policy">{{ $t("privacy policy") }}</NuxtLink> {{ $t("and consent to being contacted about my enquiry.") }}<small v-if="errors.consent" id="consent-error">{{ $t(errors.consent) }}</small></span></label>
          <button class="button button-primary contact-submit" type="submit" :disabled="pending" :aria-busy="pending">{{ pending ? $t("Sending…") : $t("Send message") }}</button>
          <p class="form-status" role="status" aria-live="polite">{{ $t(status) }}</p>
          <div class="form-reply"><span><AppIcon name="send" :size="18" /></span>{{ formCopy.replyNote }}</div>
        </form>
      </section>

      <section class="contact-paths" aria-labelledby="path-title">
        <div class="page-container">
          <div class="contact-section-heading"><p class="eyebrow">{{ paths.eyebrow }}</p><h2 id="path-title">{{ paths.title }}</h2><span class="heading-rule" aria-hidden="true"></span></div>
          <div class="path-grid">
            <article v-for="item in paths.cards" :key="item.key" class="path-item"><span class="path-icon"><AppIcon :name="item.icon || 'compass'" :size="46" /></span><div><h3>{{ item.title }}</h3><p>{{ item.description }}</p><a v-if="item.link" :href="item.link">{{ item.label }} <AppIcon name="chevron-right" :size="14" /></a></div></article>
          </div>
        </div>
      </section>

      <section class="service-area" aria-labelledby="service-title">
        <div class="service-copy">
          <p class="eyebrow">{{ serviceArea.eyebrow }}</p><h2 id="service-title">{{ serviceArea.title }}</h2><span class="heading-rule" aria-hidden="true"></span>
          <p>{{ serviceArea.body }}</p><p><template v-for="(line, index) in serviceArea.lines" :key="index"><br v-if="index" />{{ line }}</template></p>
          <NuxtLink class="button button-outline" :to="serviceArea.link">{{ serviceArea.label }}</NuxtLink>
        </div>
        <div class="service-map">
          <ClientOnly><ServiceAreaMap /></ClientOnly>
        </div>
      </section>

      <section class="contact-faq page-container" aria-labelledby="contact-faq-title">
        <div><p class="eyebrow">{{ faq.eyebrow }}</p><h2 id="contact-faq-title">{{ faq.title }}</h2></div>
        <div class="contact-faq-list">
          <article v-for="(item, index) in faq.questions" :key="item.key" :class="{ open: openFaq === index }"><h3><button type="button" :aria-expanded="openFaq === index" :aria-controls="`contact-faq-${index}`" @click="openFaq = openFaq === index ? null : index"><span>{{ item.title }}</span><AppIcon :name="openFaq === index ? 'minus' : 'plus'" :size="18" /></button></h3><div v-if="openFaq === index" :id="`contact-faq-${index}`" class="contact-faq-answer"><p>{{ item.description }}</p></div></article>
        </div>
      </section>

      <section class="contact-cta" aria-labelledby="contact-cta-title">
        <div class="contact-cta-copy"><h2 id="contact-cta-title">{{ cta.title }}</h2><p>{{ cta.body }}</p><a class="button button-primary" :href="cta.link">{{ cta.label }}</a></div>
        <div class="contact-cta-photo" role="img" :aria-label="cta.photoAlt"></div>
      </section>
    </main>

    <SiteFooter variant="contact" />
  </div>
</template>
