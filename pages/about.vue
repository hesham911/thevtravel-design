<script setup>
definePageMeta({"name": "about", "title": "About TheVTravel \u2014 Egypt, planned with local care"})
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'

const philosophy = [
  { icon: 'lock', title: 'Private by design', text: 'Your journey is crafted around you. From the pace to the places, every choice is yours.' },
  { icon: 'pin', title: 'Local knowledge', text: 'We live and work here. You benefit from trusted relationships and up-to-date local insight.' },
  { icon: 'people-pin', title: 'Clear human confirmation', text: 'A real person confirms every detail before you travel, so there are no surprises on the day.' },
]

const process = [
  { icon: 'ear', title: 'Listen', text: 'We listen carefully to understand your travel style.' },
  { icon: 'map', title: 'Design', text: 'We shape your journey with the right places and practical detail.' },
  { icon: 'person', title: 'Confirm', text: 'A real person reviews and confirms everything with you.' },
  { icon: 'sunrise', title: 'Care', text: 'We stay by your side throughout your journey in Egypt.' },
]

const bookingSteps = [
  { number: '1', title: 'Send your request', text: 'Tell us your dates, interests and travel style.' },
  { number: '2', title: 'We confirm every detail', text: 'We plan your journey and confirm everything with you.' },
  { number: '3', title: 'Pay at the start', text: 'You pay securely at the start of your trip. No online payment.' },
]

const destinations = [
  { name: 'Cairo', lines: ['Timeless heritage', 'and vibrant life.'] },
  { name: 'Luxor', lines: ['Pharaohs, temples and', 'iconic river landscapes.'] },
  { name: 'Aswan', lines: ['Serene river life and', 'Nubian culture.'] },
  { name: 'The Nile', lines: ['Sail, relax and let the', 'river set the rhythm.'] },
  { name: 'Abu Simbel', lines: ['An unforgettable journey', 'into ancient history.'] },
]

const values = [
  { icon: 'leaf', title: 'Respect culture', text: 'We promote respectful travel and meaningful connections.' },
  { icon: 'community', title: 'Support local', text: 'We work with local partners and support local livelihoods.' },
  { icon: 'protect', title: 'Protect places', text: 'We encourage responsible choices that care for nature and heritage.' },
  { icon: 'heart', title: 'Travel mindfully', text: 'We believe small choices create a better experience for everyone.' },
]
</script>

<template>
  <div class="about-page">
    <SiteHeader />

    <main>
      <section class="about-hero" aria-labelledby="about-title">
        <div class="about-hero-copy">
          <p class="eyebrow">{{ $t("About TheVTravel") }}</p>
          <h1 id="about-title">{{ $t('Egypt, planned with local care') }}</h1>
          <span class="heading-rule" aria-hidden="true"></span>
          <p>{{ $t("We create private journeys and transfers shaped around you—planned by real people who know Egypt and confirm every detail before you travel.") }}</p>
        </div>
        <div class="about-hero-photo" role="img" :aria-label='$t("A felucca sailing on the Nile at sunset")'></div>
        <svg class="about-hero-route" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true">
          <path d="M76 573C122 485 239 490 335 500c105 12 181 12 255-26 50-25 94-61 158-74" />
          <circle cx="76" cy="573" r="6" /><circle cx="590" cy="474" r="6" />
        </svg>
      </section>

      <section class="about-section philosophy-section page-container" aria-labelledby="philosophy-title">
        <div class="section-intro centered">
          <p class="eyebrow">{{ $t("Our philosophy") }}</p>
          <h2 id="philosophy-title">{{ $t("Private travel. Considered in every detail.") }}</h2>
          <p>{{ $t("Travel in Egypt should feel personal, unhurried and effortless. We believe the best journeys are built on listening closely, sharing honest advice and handling the details with care. No scripts—just thoughtful planning and local expertise you can rely on.") }}</p>
        </div>
        <div class="philosophy-grid">
          <article v-for="item in philosophy" :key="item.title" class="icon-feature">
            <span class="icon-ring"><AppIcon :name="item.icon" :size="30" /></span>
            <div><h3>{{ $t(item.title) }}</h3><p>{{ $t(item.text) }}</p></div>
          </article>
        </div>
      </section>

      <section class="route-section" aria-labelledby="route-title">
        <div class="route-layout page-container">
          <div class="route-copy">
            <p class="eyebrow">{{ $t("Route & horizon") }}</p>
            <h2 id="route-title">{{ $t("The route we follow.") }}<br />{{ $t("The horizon we keep.") }}</h2>
            <span class="heading-rule" aria-hidden="true"></span>
            <p>{{ $t("We connect the timeless places of Egypt with a travel experience that is smooth, private and deeply local.") }}</p>
          </div>
          <div class="route-process">
            <svg class="process-route-line" viewBox="0 0 900 115" preserveAspectRatio="none" aria-hidden="true">
              <path d="M18 78C72 20 145 53 207 58c72 6 111-32 174-34 77-2 86 48 158 35 56-10 68-64 133-54 58 9 93 59 194 28" />
            </svg>
            <article v-for="item in process" :key="item.title" class="process-step">
              <AppIcon :name="item.icon" :size="34" />
              <h3>{{ $t(item.title) }}</h3>
              <p>{{ $t(item.text) }}</p>
            </article>
            <div class="horizon-mark" aria-hidden="true"><AppIcon name="sunrise" :size="62" /><i></i><i></i></div>
          </div>
        </div>
      </section>

      <section id="how" class="about-section booking-section page-container" aria-labelledby="booking-title">
        <div class="section-intro centered compact">
          <p class="eyebrow">{{ $t("How TheVTravel works") }}</p>
          <h2 id="booking-title">{{ $t("Simple steps. Personal care.") }}</h2>
        </div>
        <div class="booking-steps">
          <article v-for="step in bookingSteps" :key="step.number" class="booking-step">
            <span class="step-number">{{ $t(step.number) }}</span>
            <h3>{{ $t(step.title) }}</h3>
            <p>{{ $t(step.text) }}</p>
          </article>
        </div>
        <p class="payment-note"><AppIcon name="shield" :size="26" /> {{ $t("No online payment. No deposit.") }}</p>
      </section>

      <section class="people-section" aria-labelledby="people-title">
        <div class="people-copy">
          <p class="eyebrow">{{ $t("People-focused service") }}</p>
          <h2 id="people-title">{{ $t("Real people. Here for your journey.") }}</h2>
          <span class="heading-rule" aria-hidden="true"></span>
          <p>{{ $t("From your first message to your final day in Egypt, you’ll have a dedicated local team on hand—responsive, discreet and committed to your peace of mind.") }}</p>
        </div>
        <img src="/assets/photos/people-team.png" :alt='$t("A local TheVTravel host welcoming a guest")' width="486" height="187" loading="lazy" />
      </section>

      <section class="about-section destinations-section page-container" aria-labelledby="destinations-title">
        <p class="eyebrow">{{ $t("Journeys across Egypt") }}</p>
        <h2 id="destinations-title">{{ $t("Timeless places. Seamless journeys.") }}</h2>
        <div class="destination-route">
          <svg class="destination-route-line" viewBox="0 0 1200 54" preserveAspectRatio="none" aria-hidden="true">
            <path d="M36 31C96 3 158 13 219 27s123 16 183-5 121-15 181 4 121 19 181-2 122-14 182 6 127 17 218-1" />
          </svg>
          <svg class="destination-endpoint destination-felucca" viewBox="0 0 82 92" fill="none" aria-hidden="true">
            <path d="M40 5v61M40 8 15 61h25M42 12l23 49H42M9 68c18 5 43 5 65 0M17 76h49M27 76c4 8 24 8 29 0M40 80v7M30 87h22" />
          </svg>
          <article v-for="place in destinations" :key="place.name">
            <span class="place-pin"><AppIcon name="pin" :size="27" /></span>
            <h3>{{ $t(place.name) }}</h3>
            <p><template v-for="line in place.lines" :key="line">{{ $t(line) }}<br /></template></p>
          </article>
          <svg class="destination-endpoint destination-temple" viewBox="0 0 112 84" fill="none" aria-hidden="true">
            <path d="M12 22 20 9h73l8 13M8 75V27l9-7h80l8 7v48H8ZM20 67V32h73v35M28 67V45c0-7 9-7 9 0v22M47 67V39c0-8 10-8 10 0v28M68 67V45c0-7 9-7 9 0v22M85 67V37M13 75h88M16 20l7 12M96 20l-7 12" />
          </svg>
        </div>
      </section>

      <section class="about-section values-section page-container" aria-labelledby="values-title">
        <div class="values-heading">
          <div><p class="eyebrow">{{ $t("Responsible guest care") }}</p><h2 id="values-title">{{ $t("Travel well. Leave only what is good.") }}</h2></div>
          <p>{{ $t("We care for the places we share with you and the people who welcome us. Our choices support local communities, respect culture and protect the beauty of Egypt.") }}</p>
        </div>
        <div class="values-grid">
          <article v-for="item in values" :key="item.title" class="value-item">
            <AppIcon :name="item.icon" :size="48" />
            <div><h3>{{ $t(item.title) }}</h3><p>{{ $t(item.text) }}</p></div>
          </article>
        </div>
      </section>

      <section id="request" class="about-cta" aria-labelledby="about-cta-title">
        <div class="about-cta-copy">
          <h2 id="about-cta-title">{{ $t('Ready to explore Egypt your way?') }}</h2>
          <p>{{ $t("Share your ideas and we’ll take care of the rest.") }}</p>
          <a class="button button-primary" href="#request">{{ $t("Explore journeys") }}</a>
        </div>
        <div class="about-cta-photo" role="img" :aria-label='$t("Feluccas sailing on the Nile at sunset")'></div>
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true"><path d="M0 221c111 88 239 47 349 44 90-3 135 5 229-35"/><circle cx="578" cy="230" r="6" /></svg>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
