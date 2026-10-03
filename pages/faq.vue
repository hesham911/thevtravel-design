<script setup>
definePageMeta({"name": "faq", "title": "Frequently Asked Questions \u2014 TheVTravel"})
import { computed, ref, watch } from 'vue'
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'

const categories = [
  { id: 'all', label: 'All Questions', icon: 'help-circle' },
  { id: 'booking', label: 'Booking & Requests', icon: 'calendar' },
  { id: 'payments', label: 'Payments', icon: 'card' },
  { id: 'journeys', label: 'Journeys', icon: 'map' },
  { id: 'transfers', label: 'Private Transfers', icon: 'car' },
  { id: 'before', label: 'Before You Go', icon: 'suitcase' },
  { id: 'during', label: 'During Your Trip', icon: 'camera' },
  { id: 'changes', label: 'Changes & Cancellations', icon: 'refresh' },
  { id: 'other', label: 'Other', icon: 'dots' },
]

const faqs = [
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

const activeCategory = ref('all')
const openId = ref('book-private-journey')

const visibleFaqs = computed(() => activeCategory.value === 'all'
  ? faqs
  : faqs.filter((faq) => faq.categories.includes(activeCategory.value)))

watch(visibleFaqs, (items) => {
  if (!items.some((item) => item.id === openId.value)) openId.value = items[0]?.id ?? null
})

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
      <div class="faq-hero-photo" role="img" :aria-label='$t("A felucca sailing past ancient Egyptian temple columns on the Nile at sunset")'></div>
      <div class="faq-hero-copy page-container">
        <nav class="faq-breadcrumb" :aria-label='$t("Breadcrumb")'>
          <NuxtLink to="/">{{ $t("Home") }}</NuxtLink>
          <AppIcon name="chevron-right" :size="13" />
          <span aria-current="page">{{ $t("FAQ") }}</span>
        </nav>
        <h1 id="faq-title">{{ $t('Frequently Asked Questions') }}</h1>
        <span class="heading-rule" aria-hidden="true"></span>
        <p>{{ $t("Find answers to the most common questions") }}<br class="desktop-only" /> {{ $t("about booking your private journey with us.") }}</p>
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
            <span>{{ $t(category.label) }}</span>
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
                <span>{{ $t(faq.question) }}</span>
                <AppIcon name="chevron-down" :size="19" />
              </button>
            </h2>
            <div v-if="openId === faq.id" :id="`${faq.id}-answer`" class="faq-answer" role="region" :aria-labelledby="`${faq.id}-question`">
              <p>{{ $t(faq.answer) }}</p>
            </div>
          </article>
        </section>
      </div>

      <aside class="faq-help" aria-labelledby="faq-help-title">
        <div class="faq-help-copy">
          <h2 id="faq-help-title">{{ $t("Still have questions?") }}</h2>
          <p>{{ $t("We’re here to help. Our travel experts") }}<br />{{ $t("will be happy to assist you.") }}</p>
        </div>
        <div class="faq-help-art" aria-hidden="true">
          <span class="faq-help-globe"><AppIcon name="globe" :size="29" /></span>
        </div>
        <button class="faq-whatsapp" type="button" disabled :title='$t("WhatsApp contact is not configured")'>
          <AppIcon name="whatsapp" :size="25" />
          {{ $t("Chat on WhatsApp") }}
        </button>
      </aside>
    </main>

    <SiteFooter variant="faq" />
  </div>
</template>
