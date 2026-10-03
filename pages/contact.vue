<script setup>
definePageMeta({"name": "contact", "title": "Contact Us \u2014 TheVTravel"})
import { reactive, ref } from 'vue'
import { useRoute } from '#imports'
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import { defineAsyncComponent } from 'vue'
const ServiceAreaMap = defineAsyncComponent(() => import( '~/components/ServiceAreaMap.vue'))

const route = useRoute()
const requestedJourney = typeof route.query.journey === 'string' ? route.query.journey : ''
const form = reactive({ name: '', email: '', whatsapp: '', subject: requestedJourney ? (route.query.subject === 'question' ? 'General question' : 'Journey request') : '', message: requestedJourney ? `I’m interested in ${requestedJourney}. ` : '', consent: false })
const errors = reactive({})
const status = ref('')
const openFaq = ref(null)

const paths = [
  { icon: 'compass', title: 'Journey request', text: 'Planning a private journey, day tour or custom itinerary.', cta: 'Send your request', href: '#contact-form' },
  { icon: 'car', title: 'Transfer request', text: 'Airport transfers, city to city or private car with driver.', cta: 'Request a transfer', href: '#contact-form' },
  { icon: 'ticket', title: 'Existing booking help', text: 'Changes, questions or support with your current booking.', cta: 'Get support', href: 'mailto:support@thevtravel.com' },
]

const faqs = [
  { q: 'How do I get a reply?', a: 'Send the form or email us. A real member of the team will reply personally.' },
  { q: 'Can you help me plan a custom itinerary?', a: 'Yes. Tell us your dates, interests and preferred pace and we’ll help shape the right private journey.' },
  { q: 'Can you arrange airport transfers?', a: 'Yes. We can arrange private airport and city-to-city transfers.' },
  { q: 'Do you support existing bookings?', a: 'Yes. Email support@thevtravel.com with your booking details and the change or question.' },
  { q: 'Is online payment available?', a: 'No. Payment details are confirmed personally after your request has been reviewed.' },
]

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key])
  if (!form.name.trim()) errors.name = 'Please enter your full name.'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Please enter a valid email address.'
  if (!form.subject) errors.subject = 'Please choose a subject.'
  if (!form.message.trim()) errors.message = 'Please tell us how we can help.'
  if (!form.consent) errors.consent = 'Please agree before sending your message.'
  return Object.keys(errors).length === 0
}

function submitForm() {
  status.value = ''
  if (!validate()) {
    status.value = 'Please review the highlighted fields.'
    requestAnimationFrame(() => document.querySelector('.contact-field.has-error input, .contact-field.has-error select, .contact-field.has-error textarea')?.focus())
    return
  }
  status.value = 'Your message is ready to send. Online delivery is not connected yet—please email hello@thevtravel.com.'
}
</script>

<template>
  <div class="contact-page">
    <SiteHeader />

    <main>
      <section class="contact-hero" aria-labelledby="contact-title">
        <div class="contact-hero-copy">
          <p class="eyebrow">{{ $t("We're here for you") }}</p>
          <h1 id="contact-title">{{ $t('Let’s plan the journey together.') }}</h1>
          <span class="heading-rule" aria-hidden="true"></span>
          <p>{{ $t("Have a question or ready to plan your trip?") }}<br />{{ $t("Reach out anytime—real people, real replies.") }}</p>
          <div class="reply-note"><span><AppIcon name="person" :size="26" /></span>{{ $t("We reply by message, every day.") }}</div>
        </div>
        <div class="contact-hero-photo" role="img" :aria-label='$t("A felucca sailing on the Nile at sunset")'></div>
        <svg class="contact-route" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true">
          <path d="M265 594c38-79 120-53 211-55 80-2 115 1 153-55 23-34 40-44 82-40" />
          <circle cx="629" cy="484" r="6" />
        </svg>
      </section>

      <section class="contact-main page-container" :aria-label='$t("Contact TheVTravel")'>
        <div class="contact-methods">
          <p class="eyebrow">{{ $t("Get in touch") }}</p>
          <article class="contact-method contact-method--featured" :aria-label='$t("WhatsApp unavailable")'>
            <span class="method-icon whatsapp-icon"><AppIcon name="whatsapp" :size="36" /></span>
            <div><h2>{{ $t("Message us on WhatsApp") }}</h2><p>{{ $t("Our preferred way to connect.") }}<br />{{ $t("Quick, simple and personal.") }}</p><button type="button" disabled aria-describedby="whatsapp-unavailable">{{ $t("Open WhatsApp") }} <AppIcon name="chevron-right" :size="14" /></button><small id="whatsapp-unavailable" class="method-note">{{ $t("Contact link not configured yet.") }}</small></div>
          </article>
          <article class="contact-method">
            <span class="method-icon"><AppIcon name="mail" :size="31" /></span>
            <div><h2>{{ $t("Email us") }}</h2><p>{{ $t("Send us your questions or ideas.") }}<br />{{ $t("We'll get back to you soon.") }}</p><a href="mailto:hello@thevtravel.com">{{ $t("hello@thevtravel.com") }} <AppIcon name="chevron-right" :size="14" /></a></div>
          </article>
          <article class="contact-method">
            <span class="method-icon"><AppIcon name="headset" :size="33" /></span>
            <div><h2>{{ $t("Booking support") }}</h2><p>{{ $t("Need help with an existing booking?") }}<br />{{ $t("We're here to help.") }}</p><a href="mailto:support@thevtravel.com">{{ $t("support@thevtravel.com") }} <AppIcon name="chevron-right" :size="14" /></a></div>
          </article>
          <aside class="contact-reassurance"><AppIcon name="shield" :size="34" /><p>{{ $t("Share a few details and we’ll take care of the rest,") }}<br />{{ $t("with clear replies and local insight.") }}</p></aside>
        </div>

        <form id="contact-form" class="contact-form" novalidate @submit.prevent="submitForm">
          <p class="eyebrow">{{ $t("Send us a message") }}</p>
          <div class="form-grid">
            <div class="contact-field" :class="{ 'has-error': errors.name }"><label for="contact-name">{{ $t("Full name") }}</label><input id="contact-name" v-model="form.name" name="name" autocomplete="name" :aria-invalid="!!errors.name" :aria-describedby="errors.name ? 'name-error' : undefined" /><small v-if="errors.name" id="name-error">{{ $t(errors.name) }}</small></div>
            <div class="contact-field" :class="{ 'has-error': errors.email }"><label for="contact-email">{{ $t("Email address") }}</label><input id="contact-email" v-model="form.email" name="email" type="email" autocomplete="email" :aria-invalid="!!errors.email" :aria-describedby="errors.email ? 'email-error' : undefined" /><small v-if="errors.email" id="email-error">{{ $t(errors.email) }}</small></div>
            <div class="contact-field full"><label for="contact-whatsapp">{{ $t("WhatsApp number (with country code)") }}</label><input id="contact-whatsapp" v-model="form.whatsapp" name="whatsapp" type="tel" autocomplete="tel" :placeholder='$t("e.g. +20 10 1234 5678")' /></div>
            <div class="contact-field full" :class="{ 'has-error': errors.subject }"><label for="contact-subject">{{ $t("Subject") }}</label><select id="contact-subject" v-model="form.subject" name="subject" :aria-invalid="!!errors.subject" :aria-describedby="errors.subject ? 'subject-error' : undefined"><option value="" disabled>{{ $t("Choose a subject") }}</option><option value="Journey request">{{ $t("Journey request") }}</option><option value="Private transfer">{{ $t("Private transfer") }}</option><option value="Existing booking">{{ $t("Existing booking") }}</option><option value="General question">{{ $t("General question") }}</option><option value="Other">{{ $t("Other") }}</option></select><small v-if="errors.subject" id="subject-error">{{ $t(errors.subject) }}</small></div>
            <div class="contact-field full" :class="{ 'has-error': errors.message }"><label for="contact-message">{{ $t("Message") }}</label><textarea id="contact-message" v-model="form.message" name="message" rows="5" :placeholder='$t("Tell us about your plans, questions or anything else...")' :aria-invalid="!!errors.message" :aria-describedby="errors.message ? 'message-error' : undefined"></textarea><small v-if="errors.message" id="message-error">{{ $t(errors.message) }}</small></div>
          </div>
          <label class="consent" :class="{ 'has-error': errors.consent }"><input v-model="form.consent" type="checkbox" :aria-invalid="!!errors.consent" :aria-describedby="errors.consent ? 'consent-error' : undefined" /> <span>{{ $t("I agree to the") }} <NuxtLink class="privacy-term" to="/privacy-policy">{{ $t("privacy policy") }}</NuxtLink> {{ $t("and consent to being contacted about my enquiry.") }}<small v-if="errors.consent" id="consent-error">{{ $t(errors.consent) }}</small></span></label>
          <button class="button button-primary contact-submit" type="submit">{{ $t("Send message") }}</button>
          <p class="form-status" role="status" aria-live="polite">{{ $t(status) }}</p>
          <div class="form-reply"><span><AppIcon name="send" :size="18" /></span>{{ $t("We reply by message, every day.") }}</div>
        </form>
      </section>

      <section class="contact-paths" aria-labelledby="path-title">
        <div class="page-container">
          <div class="contact-section-heading"><p class="eyebrow">{{ $t("Choose the right path") }}</p><h2 id="path-title">{{ $t("What can we help you with?") }}</h2><span class="heading-rule" aria-hidden="true"></span></div>
          <div class="path-grid">
            <article v-for="item in paths" :key="item.title" class="path-item"><span class="path-icon"><AppIcon :name="item.icon" :size="46" /></span><div><h3>{{ $t(item.title) }}</h3><p>{{ $t(item.text) }}</p><a :href="item.href">{{ $t(item.cta) }} <AppIcon name="chevron-right" :size="14" /></a></div></article>
          </div>
        </div>
      </section>

      <section class="service-area" aria-labelledby="service-title">
        <div class="service-copy">
          <p class="eyebrow">{{ $t("Where we help") }}</p><h2 id="service-title">{{ $t("Our service area") }}</h2><span class="heading-rule" aria-hidden="true"></span>
          <p>{{ $t("We create private journeys and transfers across Egypt.") }}</p><p>{{ $t("From Cairo and the Nile Valley to Luxor, Aswan,") }}<br />{{ $t("the Red Sea and beyond.") }}</p>
          <NuxtLink class="button button-outline" to="/#journeys">{{ $t("Explore journeys") }}</NuxtLink>
        </div>
        <div class="service-map">
          <ClientOnly><ServiceAreaMap /></ClientOnly>
        </div>
      </section>

      <section class="contact-faq page-container" aria-labelledby="contact-faq-title">
        <div><p class="eyebrow">{{ $t("Contact FAQ") }}</p><h2 id="contact-faq-title">{{ $t("Common questions") }}</h2></div>
        <div class="contact-faq-list">
          <article v-for="(item, index) in faqs" :key="item.q" :class="{ open: openFaq === index }"><h3><button type="button" :aria-expanded="openFaq === index" :aria-controls="`contact-faq-${index}`" @click="openFaq = openFaq === index ? null : index"><span>{{ $t(item.q) }}</span><AppIcon :name="openFaq === index ? 'minus' : 'plus'" :size="18" /></button></h3><div v-if="openFaq === index" :id="`contact-faq-${index}`" class="contact-faq-answer"><p>{{ $t(item.a) }}</p></div></article>
        </div>
      </section>

      <section class="contact-cta" aria-labelledby="contact-cta-title">
        <div class="contact-cta-copy"><h2 id="contact-cta-title">{{ $t('Ready to plan your Egypt journey?') }}</h2><p>{{ $t("Share your ideas and we'll create a journey that feels just right.") }}</p><a class="button button-primary" href="#contact-form">{{ $t("Send your request") }}</a></div>
        <div class="contact-cta-photo" role="img" :aria-label='$t("A felucca sailing the Nile at sunset")'></div>
      </section>
    </main>

    <SiteFooter variant="contact" />
  </div>
</template>
