<script setup>
definePageMeta({ name: 'journey-review', title: 'Share your journey — TheVTravel' })
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useAsyncData, useRoute, useRuntimeConfig, useSeoMeta, setResponseStatus } from '#imports'
import SiteHeader from '~/components/SiteHeader.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import AppIcon from '~/components/AppIcon.vue'
import JourneyGalleryViewer from '~/components/journey/JourneyGalleryViewer.vue'
import ReviewStarRating from '~/components/review/ReviewStarRating.vue'
import ReviewPhotoPicker from '~/components/review/ReviewPhotoPicker.vue'
import { useI18n } from '~/utils/i18n'
import { useSiteContent } from '~/composables/useSiteContent'
import { REVIEW_LIMITS, lookupJourneyReview, reviewErrors, submitJourneyReview as submitMockReview } from '~/utils/journeyReview'
import { fetchReviewContext, submitJourneyReview } from '~/services/journeyReviews'
import '~/assets/css/journey-review.css'

// The page a Journey Booking's QR code or WhatsApp link opens. The token in
// the address identifies the booking; nothing else is asked of the customer.
//
// The booking is read through the API, which serves only what is safe in the
// hands of whoever is holding the link — the journey, its date and the
// booking's own photographs. Never a price, a payment, a driver, a guide or
// the customer's own contact details.
//
// With no API base URL configured the page falls back to the local fixtures
// in `utils/journeyReview`, which is how the design is worked on offline. In
// that mode the submission is simulated and the page says so rather than
// claiming a review was received.
const { locale, translate } = useI18n()
const { whatsappUrl } = useSiteContent()
const route = useRoute()
const { public: runtime } = useRuntimeConfig()
const api = runtime.apiBaseUrl

const { data: result, refresh } = await useAsyncData(
  () => `journey-review-${route.params.token}`,
  () => fetchReviewContext(api, String(route.params.token), locale.value),
  { watch: [locale, () => route.params.token], default: () => null },
)

// In demo mode the fixtures stand in for the API's own payload, in the same
// shape, so everything below this line is indifferent to where it came from.
const demo = computed(() => {
  const lookup = lookupJourneyReview(route.params.token)

  if (lookup.status === 'invalid') return null

  return {
    journey: {
      title: lookup.booking.journey.title,
      summary: lookup.booking.journey.summary,
      location: lookup.booking.journey.location,
      image: lookup.booking.journey.image,
    },
    travelDate: lookup.booking.journey.date,
    photos: lookup.booking.photos,
    rules: null,
    review: lookup.booking.review,
  }
})

const isDemo = computed(() => result.value?.status === 'demo')
const context = computed(() => (isDemo.value ? demo.value : result.value?.context ?? null))
const photos = computed(() => context.value?.photos ?? [])
const limits = computed(() => ({
  commentMinimum: context.value?.rules?.comment_minimum ?? REVIEW_LIMITS.commentMinimum,
  comment: context.value?.rules?.comment_maximum ?? REVIEW_LIMITS.comment,
}))

// A link that does not work is a dead link for the browser and for a crawler
// alike, rather than an empty form the customer cannot submit. Every reason
// it might not work answers the same way — the API does not distinguish
// them, and neither should the page.
const unavailable = computed(() => result.value?.status === 'unavailable' || (isDemo.value && demo.value === null))
const failed = computed(() => result.value?.status === 'error')

if (import.meta.server && unavailable.value) setResponseStatus(404)
if (import.meta.server && failed.value) setResponseStatus(503)

// A private link in one customer's hands: never a page for a search engine.
useSeoMeta({
  title: () => `${translate('Share your journey')} — TheVTravel`,
  description: () => translate('Tell us how your journey went.'),
  robots: 'noindex, nofollow',
})

const form = reactive({ rating: 0, comment: '', photoIds: [], photoPublicationConsent: false })
const errors = reactive({})
const status = ref('')
// One submission at a time: the button is disabled while it is in flight and
// the handler returns early, so a double tap cannot send the review twice.
const pending = ref(false)
const sent = ref(null)
const doneHeading = ref(null)
const galleryViewer = ref(null)

const review = computed(() => sent.value || context.value?.review || null)
const view = computed(() => {
  if (unavailable.value) return 'unavailable'
  if (failed.value) return 'failed'
  if (sent.value) return 'sent'
  if (context.value?.review) return 'already-reviewed'
  return 'form'
})

const journeyDate = computed(() => formatDate(context.value?.travelDate))
const reviewDate = computed(() => formatDate(review.value?.submittedAt))
const chosenPhotos = computed(() => photos.value.filter(photo => (review.value?.photoIds ?? []).includes(photo.id)))

function formatDate(value) {
  if (!value) return ''
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function showPhoto(index, items = photos.value) {
  galleryViewer.value?.open(items, index)
}

// Inline, and only once a field has something to correct: the comment is
// checked when the customer leaves it and then kept current as they type, and
// a chosen star clears its own message immediately.
function checkComment() {
  const { comment } = reviewErrors({ rating: form.rating || 1, comment: form.comment }, limits.value)
  if (comment) errors.comment = comment
  else delete errors.comment
  clearStatusWhenCorrected()
}
// The line under the button asked the customer to check the highlighted
// fields, so it goes once there is nothing left highlighted.
function clearStatusWhenCorrected() {
  if (!Object.keys(errors).length) status.value = ''
}
watch(() => form.rating, () => { delete errors.rating; clearStatusWhenCorrected() })
watch(() => form.comment, () => { if (errors.comment) checkComment() })

async function submit() {
  if (pending.value) return
  status.value = ''
  Object.keys(errors).forEach(key => delete errors[key])
  Object.assign(errors, reviewErrors(form, limits.value))
  if (Object.keys(errors).length) {
    status.value = 'Please check the highlighted fields.'
    await nextTick()
    document.querySelector('.jr-form [aria-invalid="true"]')?.focus()
    return
  }

  pending.value = true
  try {
    // Demo mode never claims a review was received: the local adapter
    // resolves against the fixtures and the success state says as much.
    const outcome = isDemo.value
      ? { status: 'ok', created: true, context: null, review: (await submitMockReview(form, { photos: photos.value })).review }
      : await submitJourneyReview(api, String(route.params.token), form, locale.value)

    if (outcome.status === 'invalid') {
      // The API's own rules, shown beside the field they belong to. The
      // form mirrors every one of them, so this is the net under a rule it
      // could not check rather than the ordinary path.
      Object.assign(errors, {
        ...(outcome.errors.rating ? { rating: outcome.errors.rating } : {}),
        ...(outcome.errors.comment ? { comment: outcome.errors.comment } : {}),
      })
      status.value = Object.keys(errors).length
        ? 'Please check the highlighted fields.'
        : 'We couldn’t send your review. Please try again in a moment.'
      await nextTick()
      document.querySelector('.jr-form [aria-invalid="true"]')?.focus()
      return
    }

    if (outcome.status !== 'ok') {
      // Unreachable, failing, or a link that stopped working while the
      // customer was typing: never a thank you for a review nobody has.
      status.value = outcome.status === 'unavailable'
        ? 'This review link is no longer available.'
        : 'We couldn’t send your review. Please try again in a moment.'
      return
    }

    sent.value = outcome.review ?? outcome.context?.review ?? {
      rating: form.rating,
      comment: form.comment,
      photoIds: form.photoIds,
      submittedAt: new Date().toISOString().slice(0, 10),
    }
    await nextTick()
    doneHeading.value?.focus?.({ preventScroll: true })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="journey-review-page">
    <SiteHeader />

    <main class="jr-main">
      <section v-if="view === 'failed'" class="jr-unavailable">
        <AppIcon name="refresh" :size="44" />
        <h1>{{ $t("We couldn’t open your review page") }}</h1>
        <p>{{ $t("Something went wrong on our side. Please try again in a moment — your journey and your words are safe.") }}</p>
        <div class="jr-unavailable-actions">
          <button class="button button-primary" type="button" @click="refresh()">{{ $t("Try again") }}</button>
          <NuxtLink class="button button-secondary" to="/journeys">{{ $t("Explore journeys") }}</NuxtLink>
        </div>
      </section>

      <section v-else-if="view === 'unavailable'" class="jr-unavailable">
        <AppIcon name="help-circle" :size="44" />
        <h1>{{ $t("This review link isn’t available") }}</h1>
        <p>{{ $t("The link may have expired, or it may belong to a journey that has already been closed. Message us and we’ll gladly send you a new one.") }}</p>
        <div class="jr-unavailable-actions">
          <a v-if="whatsappUrl" class="button button-primary" :href="whatsappUrl" target="_blank" rel="noopener noreferrer">{{ $t("Message us on WhatsApp") }}</a>
          <NuxtLink class="button button-secondary" to="/journeys">{{ $t("Explore journeys") }}</NuxtLink>
        </div>
      </section>

      <template v-else>
        <header class="jr-head">
          <p class="eyebrow">{{ $t("Your journey review") }}</p>
          <h1>{{ $t("How was your journey?") }}</h1>
          <span class="heading-rule" aria-hidden="true"></span>
          <p class="jr-lede">{{ $t("A few words from you help other travelers choose their journey, and tell our team what mattered most to you.") }}</p>
        </header>

        <article class="jr-journey">
          <img v-if="context.journey.image.src" :src="context.journey.image.src" :alt="$t(context.journey.image.alt)" width="760" height="500" fetchpriority="high" />
          <div class="jr-journey-copy">
            <h2>{{ context.journey.title }}</h2>
            <ul class="jr-facts">
              <li v-if="journeyDate"><AppIcon name="calendar" :size="18" />{{ journeyDate }}</li>
              <li v-if="context.journey.location"><AppIcon name="pin" :size="18" />{{ context.journey.location }}</li>
            </ul>
            <p>{{ context.journey.summary }}</p>
          </div>
        </article>

        <section v-if="view !== 'form'" class="jr-done" :aria-label='$t("Your review")'>
          <span class="jr-done-mark" aria-hidden="true"><AppIcon name="check" :size="28" /></span>
          <h2 ref="doneHeading" tabindex="-1">{{ $t(view === 'sent' ? 'Thank you — your review has been received.' : 'You’ve already shared this journey') }}</h2>
          <p>{{ $t(view === 'sent' ? 'Our team reads every review. Once it’s approved it will appear on the journey’s page, and your chosen photos may appear with it.' : 'Thank you for the words you shared with us. Here is the review we have for this journey.') }}</p>

          <div class="jr-done-card">
            <div class="jr-done-rating">
              <span class="jr-shown-stars" :aria-label="$t('{count} out of 5 stars', { count: review.rating })">
                <span v-for="n in 5" :key="n" class="jr-shown-star" :class="{ filled: n <= review.rating }"><AppIcon name="star" :size="20" /></span>
              </span>
              <small v-if="reviewDate">{{ $t("Shared on") }} {{ reviewDate }}</small>
            </div>
            <p v-if="review.comment" class="jr-done-comment">{{ review.comment }}</p>
            <div v-if="chosenPhotos.length" class="jr-done-photos">
              <button
                v-for="(photo, index) in chosenPhotos"
                :key="photo.id"
                type="button"
                :aria-label="$t('View this photo larger: {description}', { description: $t(photo.alt) })"
                @click="showPhoto(index, chosenPhotos)"
              >
                <img :src="photo.src" :alt="$t(photo.alt)" loading="lazy" />
              </button>
            </div>
          </div>

          <!-- Demo mode only: with no API configured nothing was stored, and
               the page says so rather than implying a review is on its way to
               our team. -->
          <p v-if="view === 'sent' && isDemo" class="jr-prototype-note">{{ $t("Design preview: this review stays on this page only.") }}</p>
          <NuxtLink class="button button-secondary" to="/journeys">{{ $t("Explore journeys") }}</NuxtLink>
        </section>

        <form v-else class="jr-form" novalidate @submit.prevent="submit">
          <section class="jr-block">
            <ReviewStarRating
              v-model="form.rating"
              :invalid="!!errors.rating"
              :described-by="errors.rating ? 'jr-rating-error' : undefined"
            />
            <small v-if="errors.rating" id="jr-rating-error" class="jr-error">{{ $t(errors.rating) }}</small>
          </section>

          <section class="jr-block">
            <div class="jr-field" :class="{ 'has-error': errors.comment }">
              <label for="jr-comment">{{ $t("Tell us about your journey") }}</label>
              <p class="jr-hint">{{ $t("What stayed with you? The places, your guide, the pace of the day — anything another traveler would be glad to know.") }}</p>
              <textarea
                id="jr-comment"
                v-model="form.comment"
                rows="6"
                :maxlength="limits.comment"
                :placeholder='$t("We set out before sunrise and…")'
                :aria-invalid="errors.comment ? 'true' : undefined"
                :aria-describedby="errors.comment ? 'jr-comment-error jr-comment-count' : 'jr-comment-count'"
                @blur="checkComment"
              ></textarea>
              <div class="jr-field-foot">
                <small v-if="errors.comment" id="jr-comment-error" class="jr-error">{{ $t(errors.comment, { max: limits.comment }) }}</small>
                <small id="jr-comment-count" class="jr-count">{{ $t('{count} / {max}', { count: form.comment.length, max: limits.comment }) }}</small>
              </div>
            </div>
          </section>

          <section class="jr-block">
            <div class="jr-block-head">
              <h2>{{ $t("Your journey photos") }} <span class="jr-optional">{{ $t("(optional)") }}</span></h2>
              <p>{{ $t(photos.length ? 'Choose the photos you’d like to appear with your review. Pick as many as you like, or none at all.' : 'Your photos aren’t ready yet.') }}</p>
            </div>
            <ReviewPhotoPicker
              v-if="photos.length"
              :photos="photos"
              :selected="form.photoIds"
              @update:selected="form.photoIds = $event"
              @enlarge="showPhoto"
            />
            <!-- Choosing a favourite is not the same as agreeing it may be
                 shown publicly, so it is asked separately — and only once
                 there is something to agree to. Without this, nothing of
                 theirs is ever published. -->
            <label v-if="photos.length && form.photoIds.length" class="jr-consent">
              <input v-model="form.photoPublicationConsent" type="checkbox" />
              <span>{{ $t("You may show the photos I chose on TheVTravel’s website alongside my review.") }}</span>
            </label>
            <div v-else class="jd-empty-state">
              <AppIcon name="camera" :size="40" />
              <h3>{{ $t("No photos yet") }}</h3>
              <p>{{ $t("Our team is still preparing the photos from your journey. Please share your review now — we can add the photos to it later.") }}</p>
            </div>
          </section>

          <footer class="jr-actions">
            <button class="button button-primary jr-submit" type="submit" :disabled="pending" :aria-busy="pending">{{ pending ? $t("Sending…") : $t("Submit Review") }}</button>
            <p class="jr-status" role="status" aria-live="polite">{{ status ? $t(status) : '' }}</p>
          </footer>
        </form>
      </template>
    </main>

    <SiteFooter variant="booking" />
    <JourneyGalleryViewer ref="galleryViewer" />
  </div>
</template>
