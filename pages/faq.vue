<script setup>
import { computed, ref, watch } from 'vue'
import { useAsyncData, useRuntimeConfig } from '#imports'
definePageMeta({ name: 'faq', title: 'Frequently Asked Questions — TheVTravel' })
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import { useI18n } from '~/utils/i18n'
import { useSiteContent } from '~/composables/useSiteContent'
import { fetchPageSections, linesOf, textOr } from '~/services/pageContent'
import { fetchFaqCategories, fetchFaqs } from '~/services/faq'

const { locale, translate } = useI18n()
const { public: runtime } = useRuntimeConfig()
const api = runtime.apiBaseUrl
const { whatsappUrl } = useSiteContent()

// The page's words are managed under Website Content → FAQ Page; the
// questions and the chips they are filtered by are FAQ and FAQ Category
// records, edited in their own screens. Both are refetched when the visitor
// switches language.
const { data: sections } = await useAsyncData(
  'faq-sections',
  () => fetchPageSections(api, 'faq', locale.value),
  { watch: [locale], default: () => null },
)

const { data: categoryResult } = await useAsyncData(
  'faq-categories',
  () => fetchFaqCategories(api, locale.value),
  { watch: [locale], default: () => null },
)

const { data: faqResult } = await useAsyncData(
  'faq-questions',
  () => fetchFaqs(api, locale.value),
  { watch: [locale], default: () => null },
)

// The page's own questions, used only while the API has none to serve (no
// API base URL configured, or the API unreachable). Every string stays
// translatable through the demo table, exactly as before.
const demoCategories = [
  { id: 'booking', label: 'Booking & Requests', icon: 'calendar' },
  { id: 'payments', label: 'Payments', icon: 'card' },
  { id: 'journeys', label: 'Journeys', icon: 'map' },
  { id: 'transfers', label: 'Private Transfers', icon: 'car' },
  { id: 'before', label: 'Before You Go', icon: 'suitcase' },
  { id: 'during', label: 'During Your Trip', icon: 'camera' },
  { id: 'changes', label: 'Changes & Cancellations', icon: 'refresh' },
  { id: 'other', label: 'Other', icon: 'dots' },
]

const demoFaqs = [
  {
    id: 'book-private-journey',
    question: 'How do I book a private journey?',
    categories: ['booking'],
    answer: 'Simply choose the journey you’re interested in and click “Request this journey”.\nFill in your details, preferred date, number of travelers and any special requests.\nWe’ll contact you within 24 hours to confirm availability and all the details.',
  },
  { id: 'fixed-dates', question: 'Do you have fixed dates for the journeys?', categories: ['booking'], answer: 'Our private journeys are planned around your preferred dates, subject to availability. Send your request and our team will confirm the details with you.' },
  { id: 'how-pay', question: 'How and when do I pay?', categories: ['payments'], answer: 'Payment details are confirmed with you personally once your journey and availability have been agreed.' },
  { id: 'deposit', question: 'Is there an online payment or deposit?', categories: ['payments'], answer: 'No online payment or deposit is required. A member of our team will confirm the arrangements with you.' },
  { id: 'customize', question: 'Can I customize my itinerary?', categories: ['journeys'], answer: 'Yes. Share your interests, pace and priorities in your request so the journey can be shaped around you.' },
  { id: 'included', question: 'What’s included in the price?', categories: ['journeys', 'during'], answer: 'Inclusions vary by journey. Your confirmation will clearly set out what is included before you travel.' },
  { id: 'transfer-only', question: 'Can I book a private transfer only?', categories: ['transfers'], answer: 'Yes. Private transfers can be requested independently of a journey.' },
  { id: 'change-cancel', question: 'What if I need to change or cancel my request?', categories: ['changes'], answer: 'Contact our team as soon as your plans change and we’ll help you review the available options.' },
  { id: 'insurance', question: 'Is travel insurance included?', categories: ['before', 'other'], answer: 'Travel insurance is not included. We recommend arranging suitable cover before your trip.' },
]

const hero = computed(() => {
  const section = sections.value?.hero
  return {
    title: textOr(section?.title, translate('Frequently Asked Questions')),
    lines: linesOf(section?.body, [
      translate('Find answers to the most common questions'),
      translate('about booking your private journey with us.'),
    ]),
    photoAlt: textOr(section?.data?.image_alt, translate('A felucca sailing past ancient Egyptian temple columns on the Nile at sunset')),
    image: section?.media?.image?.url || null,
  }
})

const heroPhotoStyle = computed(() => hero.value.image ? { '--hero-image': `url(${JSON.stringify(hero.value.image)})` } : null)

const help = computed(() => {
  const section = sections.value?.help
  return {
    title: textOr(section?.title, translate('Still have questions?')),
    lines: linesOf(section?.body, [
      translate('We’re here to help. Our travel experts'),
      translate('will be happy to assist you.'),
    ]),
    cta: textOr(section?.data?.cta_text, translate('Chat on WhatsApp')),
  }
})

// "All Questions" is not a category: it is the unfiltered state, so its chip
// is this page's own and is always first.
const categories = computed(() => [
  { id: 'all', label: translate('All Questions'), icon: 'help-circle' },
  ...(categoryResult.value?.status === 'ok'
    ? categoryResult.value.categories
    : demoCategories.map(category => ({ ...category, label: translate(category.label) }))),
])

const faqs = computed(() => faqResult.value?.status === 'ok'
  ? faqResult.value.faqs
  : demoFaqs.map(faq => ({ ...faq, question: translate(faq.question), answer: translate(faq.answer) })))

const activeCategory = ref('all')
const openId = ref(null)

const visibleFaqs = computed(() => activeCategory.value === 'all'
  ? faqs.value
  : faqs.value.filter((faq) => faq.categories.includes(activeCategory.value)))

// The first question of whatever is on screen is the one left open, so
// filtering never leaves the accordion showing an answer to a question that
// is no longer listed.
watch(visibleFaqs, (items) => {
  if (!items.some((item) => item.id === openId.value)) openId.value = items[0]?.id ?? null
}, { immediate: true })

function selectCategory(id) {
  activeCategory.value = id
}

function toggleFaq(id) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <div class="faq-page">
    <SiteHeader />

    <section class="faq-hero" aria-labelledby="faq-title">
      <div class="faq-hero-photo" role="img" :aria-label="hero.photoAlt" :style="heroPhotoStyle"></div>
      <div class="faq-hero-copy page-container">
        <nav class="faq-breadcrumb" :aria-label='$t("Breadcrumb")'>
          <NuxtLink to="/">{{ $t("Home") }}</NuxtLink>
          <AppIcon name="chevron-right" :size="13" />
          <span aria-current="page">{{ $t("FAQ") }}</span>
        </nav>
        <h1 id="faq-title">{{ hero.title }}</h1>
        <span class="heading-rule" aria-hidden="true"></span>
        <p><template v-for="(line, index) in hero.lines" :key="index"><br v-if="index" class="desktop-only" />{{ index ? ' ' : '' }}{{ line }}</template></p>
      </div>
    </section>

    <main class="faq-main page-container">
      <div class="faq-layout">
        <nav class="faq-categories" :aria-label='$t("FAQ categories")'>
          <button
            v-for="category in categories"
            :key="category.id"
            type="button"
            :class="{ active: activeCategory === category.id }"
            :aria-current="activeCategory === category.id ? 'true' : undefined"
            @click="selectCategory(category.id)"
          >
            <AppIcon :name="category.icon" :size="21" />
            <span>{{ category.label }}</span>
          </button>
        </nav>

        <section class="faq-accordion" :aria-label='$t("Frequently asked questions")'>
          <article v-for="faq in visibleFaqs" :key="faq.id" class="faq-item" :class="{ open: openId === faq.id }">
            <h2>
              <button
                :id="`${faq.id}-question`"
                type="button"
                :aria-expanded="openId === faq.id"
                :aria-controls="`${faq.id}-answer`"
                @click="toggleFaq(faq.id)"
              >
                <span>{{ faq.question }}</span>
                <AppIcon name="chevron-down" :size="19" />
              </button>
            </h2>
            <div v-if="openId === faq.id" :id="`${faq.id}-answer`" class="faq-answer" role="region" :aria-labelledby="`${faq.id}-question`">
              <p>{{ faq.answer }}</p>
            </div>
          </article>
        </section>
      </div>

      <aside class="faq-help" aria-labelledby="faq-help-title">
        <div class="faq-help-copy">
          <h2 id="faq-help-title">{{ help.title }}</h2>
          <p><template v-for="(line, index) in help.lines" :key="index"><br v-if="index" />{{ line }}</template></p>
        </div>
        <div class="faq-help-art" aria-hidden="true">
          <span class="faq-help-globe"><AppIcon name="globe" :size="29" /></span>
        </div>
        <a v-if="whatsappUrl" class="faq-whatsapp" :href="whatsappUrl" target="_blank" rel="noopener noreferrer">
          <AppIcon name="whatsapp" :size="25" />
          {{ help.cta }}
        </a>
        <button v-else class="faq-whatsapp" type="button" disabled :title='$t("WhatsApp contact is not configured")'>
          <AppIcon name="whatsapp" :size="25" />
          {{ help.cta }}
        </button>
      </aside>
    </main>

    <SiteFooter variant="faq" />
  </div>
</template>
