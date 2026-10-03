<script setup>
definePageMeta({"name": "how-booking-works", "title": "How Booking Works \u2014 TheVTravel"})
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import NeedHelpCTA from '~/components/NeedHelpCTA.vue'

const steps = [
  { number: '01', icon: 'search', title: 'Explore journeys', description: 'Browse our handpicked private experiences across Egypt and find the one that inspires you.' },
  { number: '02', icon: 'booking-calendar', title: 'Request your date & details', description: 'Choose your preferred date, number of travelers and any special requests.' },
  { number: '03', icon: 'person', title: 'We confirm availability', description: 'We check availability and send you a personalized confirmation.' },
  { number: '04', icon: 'chat', title: 'We get in touch with you', description: 'Our travel expert contacts you via WhatsApp to finalize the details.' },
  { number: '05', icon: 'checklist', title: 'You’re all set!', description: 'Once everything is confirmed, your journey is ready to go.' },
  { number: '06', icon: 'pin', title: 'Enjoy your journey', description: 'Relax and enjoy your private experience. We take care of everything.' },
]
</script>

<template>
  <div class="booking-page">
    <SiteHeader />

    <main>
      <section class="booking-hero" aria-labelledby="booking-page-title">
        <div class="booking-hero-copy">
          <p class="eyebrow">{{ $t("Simple, private & personal") }}</p>
          <h1 id="booking-page-title">{{ $t("How booking works") }}</h1>
          <p>{{ $t("Booking your private journey with TheVTravel") }}<br class="desktop-only" /> {{ $t("is simple and flexible. You choose the experience,") }}<br class="desktop-only" /> {{ $t("we take care of the rest.") }}</p>
        </div>
        <div class="booking-hero-photo" role="img" :aria-label='$t("A felucca sailing beside ancient temple columns on the Nile at sunset")'></div>
        <svg class="booking-hero-route" viewBox="0 0 520 150" fill="none" aria-hidden="true">
          <path d="M5 131C56 90 116 111 166 104c48-7 59-37 105-29 45 8 73 31 118 5 20-12 28-31 39-54" />
          <circle cx="271" cy="75" r="6" />
          <g transform="translate(428 26)">
            <path d="M0-10a10 10 0 0 0-10 10c0 7 10 17 10 17S10 7 10 0A10 10 0 0 0 0-10Z" fill="currentColor" stroke="none" />
            <circle cy="0" r="3.2" class="booking-route-pin-center" stroke="none" />
          </g>
          <path class="booking-route-arrow" d="M452 34c9-3 17 0 23 7m-4-6 4 6-6 2" />
        </svg>
      </section>

      <section class="booking-steps-section page-container" aria-labelledby="booking-steps-title">
        <header class="booking-section-heading">
          <h2 id="booking-steps-title">{{ $t("Your journey in 6 easy steps") }}</h2>
          <span aria-hidden="true"></span>
        </header>

        <div class="booking-step-grid">
          <article v-for="step in steps" :key="step.number" class="booking-step-card">
            <span class="booking-step-number">{{ $t(step.number) }}</span>
            <span class="booking-step-icon"><AppIcon :name="step.icon" :size="54" /></span>
            <h3>{{ $t(step.title) }}</h3>
            <i aria-hidden="true"></i>
            <p>{{ $t(step.description) }}</p>
          </article>
        </div>

        <aside class="payment-panel" :aria-label='$t("Payment information")'>
          <div>
            <h2>{{ $t("No online payment required") }}</h2>
            <p>{{ $t("Payment is taken manually at the start of your trip.") }}</p>
          </div>
        </aside>
      </section>

      <NeedHelpCTA floating />
    </main>

    <SiteFooter variant="booking" />

  </div>
</template>
