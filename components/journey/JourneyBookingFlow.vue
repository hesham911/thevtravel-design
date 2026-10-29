<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import JourneyIcon from './JourneyIcon.vue'
import { useI18n } from '~/utils/i18n'
import { fetchJourneyPrice, submitJourneyBooking } from '~/services/journeyBookings'
import { formatUSD } from '~/utils/currency'
const { locale } = useI18n()
const { public: runtime } = useRuntimeConfig()
const api = runtime.apiBaseUrl
import JourneyBookingSummary from './JourneyBookingSummary.vue'
import '~/assets/css/journey-booking.css'
import { useRequestOverlay } from '~/composables/useRequestOverlay'
const props = defineProps({ journey: { type: Object, required: true } })
const emit = defineEmits(['open-change', 'request-draft'])
const dialog = ref(null), scrollArea = ref(null), heading = ref(null)
const countries = [
  { id: 'EG', name: 'Egypt', flag: '🇪🇬', code: '+20' },
  { id: 'US', name: 'United States', flag: '🇺🇸', code: '+1' },
  { id: 'GB', name: 'United Kingdom', flag: '🇬🇧', code: '+44' },
  { id: 'DE', name: 'Germany', flag: '🇩🇪', code: '+49' },
  { id: 'FR', name: 'France', flag: '🇫🇷', code: '+33' },
  { id: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', code: '+971' },
  { id: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', code: '+966' },
]
const state = reactive({ adults: 2, children: 0, infants: 0, travelDate: '', country: 'EG', fullName: '', phoneCountry: 'EG', phoneCode: '+20', phoneNumber: '', email: '', notes: '', currentStep: 1 })
// One age per child, because the backend prices each child on their own age
// rather than on a band the form picked. The ages are kept beside the
// counter rather than replacing it: the counter is how the dialog has always
// asked, and the ages are what the price actually depends on.
const childAges = ref([])
const errors = ref({})
// What the backend says this party pays. The dialog may show it; it never
// sends it — the booking endpoint has no price field, so the figure a
// customer sees and the figure that is stored come from the same place.
const quote = ref(null)
const quoting = ref(false)
// The request, once it has been sent and acknowledged.
const submitted = ref(null)
const submitError = ref('')
const sending = ref(false)
const countryName = computed(() => countries.find(c => c.id === state.country)?.name || state.country)
const dateLabel = computed(() => state.travelDate ? new Intl.DateTimeFormat(locale.value, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${state.travelDate}T12:00:00`)) : '')
const mobileTitle = computed(() => ['Plan your journey', 'Your contact details', 'Review your request'][state.currentStep - 1])
const travelers = [['adults', 'Adults', 'Ages 12+', 1], ['children', 'Children', 'Ages 1–12', 0], ['infants', 'Infants', 'Under 1 year', 0]]
const { openOverlay, closeOverlay: close, overlayClosed: closed } = useRequestOverlay(dialog, value => emit('open-change', value))
async function open() {
  Object.assign(state, { adults: 2, children: 0, infants: 0, travelDate: '', country: props.journey.countryCode || 'EG', fullName: '', phoneCountry: 'EG', phoneCode: '+20', phoneNumber: '', email: '', notes: '', currentStep: 1 })
  childAges.value = []
  errors.value = {}
  quote.value = null
  submitted.value = null
  submitError.value = ''
  await openOverlay()
  resetStepPosition()
}
function resetStepPosition() {
  heading.value?.focus({ preventScroll: true })
  scrollArea.value?.scrollTo({ top: 0, behavior: 'instant' })
  dialog.value?.scrollTo({ top: 0, behavior: 'instant' })
}
async function go(step) { state.currentStep = step; errors.value = {}; await nextTick(); resetStepPosition() }
function phoneCountryChanged() { state.phoneCode = countries.find(c => c.id === state.phoneCountry)?.code || '' }
async function validate(step) {
  const e = {}
  if (step === 1) {
    if (state.adults < 1) e.adults = 'Include at least one adult.'
    if (!state.travelDate || Number.isNaN(new Date(`${state.travelDate}T12:00:00`).getTime())) e.travelDate = 'Choose your travel date.'
    // Any future date is accepted: there is no departure inventory, and the
    // team confirms availability by hand. Only the past is refused.
    else if (state.travelDate < new Date().toISOString().slice(0, 10)) e.travelDate = 'Choose a date in the future.'
    if (!state.country) e.country = 'Select a country.'
    // Each child is priced on their own age, so an age is asked for each.
    if (childAges.value.some(age => age === null || age === '' || Number.isNaN(Number(age)))) {
      e.childAges = 'Tell us how old each child will be on the journey.'
    }
  } else {
    if (!state.fullName.trim()) e.fullName = 'Enter your full name.'
    if (!state.phoneNumber.trim()) e.phoneNumber = 'Enter your phone number.'
    else if (!/^[\d\s().-]+$/.test(state.phoneNumber) || state.phoneNumber.replace(/\D/g, '').length < 5 || state.phoneNumber.replace(/\D/g, '').length > 15) e.phoneNumber = 'Enter a valid phone number.'
    if (state.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) e.email = 'Enter a valid email address, or leave it blank.'
  }
  errors.value = e
  if (Object.keys(e).length) { await nextTick(); dialog.value.querySelector('[aria-invalid="true"]')?.focus(); return false }
  return true
}
async function next() {
  if (!await validate(state.currentStep)) return
  // The quote is fetched as the customer leaves step one, so the review
  // step shows a real figure rather than a guess.
  if (state.currentStep === 1) refreshQuote()
  go(state.currentStep + 1)
}
/**
 * Sends the request.
 *
 * One at a time: the button is disabled while it is in flight and the
 * handler returns early, so a double tap cannot send the same request
 * twice. Nothing the customer typed is cleared unless the request was
 * actually recorded, so a retry after a network failure costs them nothing.
 */
async function confirm() {
  if (sending.value) return
  if (!await validate(1)) { go(1); return }
  if (!await validate(2)) { go(2); return }

  submitError.value = ''
  sending.value = true

  try {
    const request = {
      journeyId: props.journey.id,
      fullName: state.fullName.trim(),
      phoneCode: state.phoneCode,
      phoneNumber: state.phoneNumber.trim(),
      email: state.email.trim(),
      notes: state.notes.trim(),
      travelDate: state.travelDate,
      ...travellers(),
    }

    emit('request-draft', request)

    const result = await submitJourneyBooking(api, request, locale.value)

    if (result.status === 'ok') {
      submitted.value = result.booking
      state.currentStep = 4
      await nextTick()
      resetStepPosition()

      return
    }

    if (result.status === 'invalid') {
      // The API's rules, mapped back onto the fields the dialog shows. A
      // rejection naming nothing here would leave the customer reading
      // about fields that are not highlighted.
      errors.value = {
        ...(result.errors.full_name ? { fullName: result.errors.full_name } : {}),
        ...(result.errors.phone_number ? { phoneNumber: result.errors.phone_number } : {}),
        ...(result.errors.email ? { email: result.errors.email } : {}),
        ...(result.errors.travel_date ? { travelDate: result.errors.travel_date } : {}),
      }
      submitError.value = Object.keys(errors.value).length
        ? 'Please check the highlighted details.'
        : 'We couldn’t send your request. Please try again, or message us on WhatsApp.'
      go(Object.keys(errors.value).some(field => field === 'travelDate') ? 1 : 2)

      return
    }

    // Unreachable, failing, or not configured at all: never a confirmation
    // for a request that went nowhere.
    submitError.value = result.status === 'demo'
      ? 'Requests are not available right now. Please message us on WhatsApp.'
      : 'We couldn’t send your request. Please try again, or message us on WhatsApp.'
  } finally {
    sending.value = false
  }
}
watch(() => state.children, count => {
  childAges.value = Array.from({ length: count }, (_, index) => childAges.value[index] ?? null)
})

/** The travellers as the API asks for them: an age for every child. */
function travellers() {
  return {
    adults: state.adults,
    children: [
      // Infants are under a year old, which the age bands price as free;
      // the form already asks for them separately, so their age is known.
      ...Array.from({ length: state.infants }, () => ({ age: 0 })),
      ...childAges.value.map(age => ({ age: Number(age) })),
    ],
  }
}

/** Asks the backend what this party would pay, for the review step. */
async function refreshQuote() {
  quote.value = null

  if (!api || !state.travelDate) return

  quoting.value = true
  try {
    const result = await fetchJourneyPrice(api, props.journey.slug, {
      travelDate: state.travelDate,
      ...travellers(),
      language: locale.value,
    })
    quote.value = result.status === 'ok' ? result.quote : null
  } finally {
    quoting.value = false
  }
}

watch(() => props.journey.slug, close)
defineExpose({ open })
</script>
<template>
  <dialog ref="dialog" class="jb-dialog" aria-labelledby="jb-title" @close="closed" @click="($event.target === dialog) && close()">
    <div class="jb-panel">
      <span class="jb-handle" aria-hidden="true"></span>
      <button class="jb-close" type="button" :aria-label='$t("Close booking request")' @click="close"><JourneyIcon name="close" :size="26" /></button>
      <div ref="scrollArea" class="jb-scroll">
        <header class="jb-header"><h2 id="jb-title" ref="heading" tabindex="-1"><span class="jb-desktop">{{ $t("Request a Trip") }}</span><span class="jb-mobile">{{ $t(mobileTitle) }}</span></h2><p class="jb-desktop">{{ $t("Tell us the details and we'll get in touch to confirm your booking.") }}</p><p v-if="state.currentStep < 4" class="jb-mobile">{{ $t("Step") }} {{ $t(state.currentStep) }} {{ $t("of 3") }}</p></header>
        <ol v-if="state.currentStep < 4" class="jb-stepper" :aria-label='$t("Booking progress")'><li v-for="(label, i) in ['Trip details', 'Contact details', 'Review & confirm']" :key="label" :class="{ reached: state.currentStep > i, current: state.currentStep === i + 1 }" :aria-current="state.currentStep === i + 1 ? 'step' : undefined"><span class="jb-marker"><JourneyIcon v-if="state.currentStep > i + 1" name="check" :size="20" /><template v-else>{{ $t(i + 1) }}</template></span><span>{{ $t(label) }}</span></li></ol>
        <form novalidate @submit.prevent="state.currentStep === 3 ? confirm() : next()">
          <JourneyBookingSummary v-if="state.currentStep < 3" class="jb-desktop-summary" :journey="journey" />
          <div v-if="state.currentStep === 1" class="jb-trip">
            <section><h3 class="jb-section-label"><JourneyIcon name="community" />{{ $t("Travelers") }}</h3><div class="jb-traveler-rows"><div v-for="[key, label, age, min] in travelers" :key="key" class="jb-traveler"><div>{{ $t(label) }}<small>{{ $t(age) }}</small></div><div class="jb-counter"><button type="button" :aria-label="$t(`Remove one ${label.toLowerCase()}`)" :disabled="state[key] <= min" @click="state[key]--"><JourneyIcon name="minus" :size="18" /></button><output :aria-label="$t(`${label} count`)" aria-live="polite">{{ $t(state[key]) }}</output><button type="button" :aria-label="$t(`Add one ${label.toLowerCase()}`)" @click="state[key]++"><JourneyIcon name="plus" :size="18" /></button></div></div></div><p v-if="errors.adults" class="jb-error">{{ $t(errors.adults) }}</p>
              <div v-if="state.children" class="jb-child-ages">
                <p class="jb-section-label">{{ $t("How old will each child be on the journey?") }}</p>
                <div class="jb-child-age-rows">
                  <label v-for="(age, index) in childAges" :key="index" class="jb-field jb-child-age">
                    <span>{{ $t("Child") }} {{ $t(index + 1) }}</span>
                    <input
                      v-model="childAges[index]"
                      type="number"
                      inputmode="numeric"
                      min="0"
                      max="17"
                      required
                      :aria-invalid="!!errors.childAges"
                      :aria-describedby="errors.childAges ? 'jb-child-ages-error' : undefined"
                    />
                  </label>
                </div>
                <small v-if="errors.childAges" id="jb-child-ages-error" class="jb-error">{{ $t(errors.childAges) }}</small>
              </div></section>
            <label class="jb-field jb-icon-field" for="jb-date"><span><JourneyIcon name="calendar" />{{ $t("Travel date") }}</span><input id="jb-date" v-model="state.travelDate" type="date" required :aria-invalid="!!errors.travelDate" :aria-describedby="errors.travelDate ? 'jb-date-error' : undefined" /><small v-if="errors.travelDate" id="jb-date-error" class="jb-error">{{ $t(errors.travelDate) }}</small></label>
            <label class="jb-field jb-icon-field" for="jb-country"><span><JourneyIcon name="pin" />{{ $t("Country") }}</span><span class="jb-country-control"><select id="jb-country" v-model="state.country" required :aria-invalid="!!errors.country" :aria-describedby="errors.country ? 'jb-country-error' : undefined"><option value="" disabled>{{ $t("Select a country") }}</option><option v-for="c in countries" :key="c.id" :value="c.id">{{ $t(c.flag) }} {{ $t(c.name) }}</option><option v-if="!countries.some(c => c.id === state.country)" :value="state.country">{{ $t(state.country) }}</option></select><JourneyIcon name="chevron-down" :size="20" /></span><small v-if="errors.country" id="jb-country-error" class="jb-error">{{ $t(errors.country) }}</small></label>
          </div>
          <div v-else-if="state.currentStep === 2" class="jb-contact">
            <div class="jb-contact-intro"><JourneyIcon name="person" :size="28" /><div><h3>{{ $t("Contact details") }}</h3><p>{{ $t("Let us know how to reach you.") }}</p></div></div>
            <label class="jb-field" for="jb-name"><span>{{ $t("Full name") }}</span><input id="jb-name" v-model="state.fullName" autocomplete="name" :placeholder='$t("e.g. John Smith")' required :aria-invalid="!!errors.fullName" :aria-describedby="errors.fullName ? 'jb-name-error' : undefined" /><small v-if="errors.fullName" id="jb-name-error" class="jb-error">{{ $t(errors.fullName) }}</small></label>
            <div class="jb-field"><label for="jb-phone">{{ $t("Phone number") }}</label><div class="jb-phone"><select v-model="state.phoneCountry" :aria-label='$t("Phone country and calling code")' @change="phoneCountryChanged"><option v-for="c in countries" :key="c.id" :value="c.id">{{ $t(c.flag) }} {{ $t(c.code) }} · {{ $t(c.name) }}</option></select><input id="jb-phone" v-model="state.phoneNumber" type="tel" inputmode="tel" autocomplete="tel-national" :placeholder='$t("e.g. 10 1234 5678")' required :aria-invalid="!!errors.phoneNumber" :aria-describedby="errors.phoneNumber ? 'jb-phone-error' : undefined" /></div><small v-if="errors.phoneNumber" id="jb-phone-error" class="jb-error">{{ $t(errors.phoneNumber) }}</small></div>
            <label class="jb-field" for="jb-email"><span>{{ $t("Email address") }} <span class="jb-optional">{{ $t("(optional)") }}</span></span><input id="jb-email" v-model="state.email" type="email" autocomplete="email" :placeholder='$t("e.g. john.smith@example.com")' :aria-invalid="!!errors.email" :aria-describedby="errors.email ? 'jb-email-error' : undefined" /><small v-if="errors.email" id="jb-email-error" class="jb-error">{{ $t(errors.email) }}</small></label>
            <label class="jb-field" for="jb-notes"><span>{{ $t("Anything we should know?") }} <span class="jb-optional">{{ $t("(optional)") }}</span></span><textarea id="jb-notes" v-model="state.notes" rows="3" maxlength="2000" :placeholder='$t("Dietary needs, a special occasion, anything at all.")'></textarea></label>
          </div>
          <div v-else-if="state.currentStep === 4" class="jb-review jb-sent">
            <div class="jb-review-intro">
              <h3>{{ $t("Thank you — your request is with us.") }}</h3>
              <p>{{ $t("Our team will message you on WhatsApp to confirm the date, the price and the details. Nothing is charged until you have agreed them.") }}</p>
            </div>
            <dl>
              <div><dt>{{ $t("Reference") }}</dt><dd>{{ submitted?.reference }}</dd></div>
              <div><dt>{{ $t("Journey") }}</dt><dd>{{ $t(journey.title) }}</dd></div>
              <div><dt>{{ $t("Date") }}</dt><dd>{{ $t(dateLabel) }}</dd></div>
              <div v-if="submitted?.price?.calculated_total">
                <dt>{{ $t("Estimated total") }}</dt>
                <dd>{{ formatUSD(submitted.price.calculated_total) }}</dd>
              </div>
              <div v-else><dt>{{ $t("Estimated total") }}</dt><dd>{{ $t("Price on request") }}</dd></div>
            </dl>
          </div>
          <div v-else class="jb-review">
            <div class="jb-review-intro"><h3>{{ $t("Review your request") }}</h3><p>{{ $t("Please check your details below before submitting your request.") }}</p></div>
            <JourneyBookingSummary class="jb-mobile" :journey="journey" review />
            <section><div class="jb-review-heading"><h3><JourneyIcon name="calendar" />{{ $t("Trip details") }}</h3><button type="button" @click="go(1)">{{ $t("Edit") }}<span class="jb-sr-only"> {{ $t("trip details") }}</span></button></div><dl><div><dt>{{ $t("Date") }}</dt><dd>{{ $t(dateLabel) }}</dd></div><div><dt>{{ $t("Country") }}</dt><dd>{{ $t(countryName) }}</dd></div><div><dt>{{ $t("Travelers") }}</dt><dd><span class="jb-desktop">{{ $t(state.adults) }} {{ $t(state.adults === 1 ? 'adult' : 'adults') }}<template v-if="state.children">, {{ $t(state.children) }} {{ $t("children") }}</template><template v-if="state.infants">, {{ $t(state.infants) }} {{ $t("infants") }}</template></span><span class="jb-mobile">{{ $t(state.adults) }} {{ $t("Adults,") }} {{ $t(state.children) }} {{ $t("Children,") }} {{ $t(state.infants) }} {{ $t("Infants") }}</span></dd></div></dl></section>
            <section v-if="quote || quoting">
              <div class="jb-review-heading"><h3><JourneyIcon name="card" />{{ $t("Estimated total") }}</h3></div>
              <dl>
                <div v-if="quoting"><dt>{{ $t("Estimated total") }}</dt><dd>{{ $t("Calculating…") }}</dd></div>
                <template v-else-if="quote?.price_on_request">
                  <div><dt>{{ $t("Estimated total") }}</dt><dd>{{ $t("Price on request") }}</dd></div>
                </template>
                <template v-else>
                  <div><dt>{{ $t("Estimated total") }}</dt><dd>{{ formatUSD(quote.total) }}</dd></div>
                  <div><dt>{{ $t("Adults") }}</dt><dd>{{ $t(state.adults) }} × {{ formatUSD(quote.base_adult_price) }}</dd></div>
                </template>
              </dl>
              <p class="jb-quote-note">{{ $t("Worked out by our team's own pricing. We confirm the final amount with you before anything is agreed.") }}</p>
            </section>
            <section><div class="jb-review-heading"><h3><JourneyIcon name="person" />{{ $t("Contact details") }}</h3><button type="button" @click="go(2)">{{ $t("Edit") }}<span class="jb-sr-only"> {{ $t("contact details") }}</span></button></div><dl><div><dt>{{ $t("Full name") }}</dt><dd>{{ state.fullName }}</dd></div><div><dt>{{ $t("Phone number") }}</dt><dd>{{ state.phoneCode }} {{ state.phoneNumber }}</dd></div><div><dt>{{ $t("Email") }}</dt><dd>{{ $t(state.email || 'Not provided') }}</dd></div></dl></section>
          </div>
          <footer v-if="state.currentStep === 4" class="jb-actions"><button class="jd-button jd-primary" type="button" @click="close">{{ $t("Done") }}</button></footer>
          <footer v-else class="jb-actions"><button v-if="state.currentStep > 1" class="jd-button jb-back" type="button" @click="go(state.currentStep - 1)"><JourneyIcon name="arrow" />{{ $t("Back") }}</button><button class="jd-button jd-primary" type="submit" :disabled="sending" :aria-busy="sending">{{ $t(state.currentStep === 3 ? (sending ? 'Sending…' : 'Confirm request') : 'Continue') }}<JourneyIcon name="arrow" /></button><button v-if="state.currentStep === 3" type="button" class="jd-button jb-mobile jb-edit-details" @click="go(1)">{{ $t("Edit details") }}</button></footer>
          <p v-if="submitError" class="jb-error jb-submit-error" role="status" aria-live="polite">{{ $t(submitError) }}</p>
        </form>
      </div>
    </div>
  </dialog>
</template>
