<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import JourneyIcon from './JourneyIcon.vue'
import { useI18n } from '~/utils/i18n'
const { locale } = useI18n()
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
const state = reactive({ adults: 2, children: 0, infants: 0, travelDate: '', country: 'EG', fullName: '', phoneCountry: 'EG', phoneCode: '+20', phoneNumber: '', email: '', currentStep: 1 })
const errors = ref({})
const countryName = computed(() => countries.find(c => c.id === state.country)?.name || state.country)
const dateLabel = computed(() => state.travelDate ? new Intl.DateTimeFormat(locale.value, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${state.travelDate}T12:00:00`)) : '')
const mobileTitle = computed(() => ['Plan your journey', 'Your contact details', 'Review your request'][state.currentStep - 1])
const travelers = [['adults', 'Adults', 'Ages 12+', 1], ['children', 'Children', 'Ages 1–12', 0], ['infants', 'Infants', 'Under 1 year', 0]]
const { openOverlay, closeOverlay: close, overlayClosed: closed } = useRequestOverlay(dialog, value => emit('open-change', value))
async function open() {
  Object.assign(state, { adults: 2, children: 0, infants: 0, travelDate: '', country: props.journey.countryCode || 'EG', fullName: '', phoneCountry: 'EG', phoneCode: '+20', phoneNumber: '', email: '', currentStep: 1 })
  errors.value = {}
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
    if (!state.country) e.country = 'Select a country.'
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
async function next() { if (await validate(state.currentStep)) go(state.currentStep + 1) }
// Local adapter: replace this with an API call when request integration is available.
function submitDraft(request) { emit('request-draft', request); return request }
async function confirm() {
  if (!await validate(1)) { go(1); return }
  if (!await validate(2)) { go(2); return }
  submitDraft({ journeySlug: props.journey.slug, ...state, fullName: state.fullName.trim(), email: state.email.trim() })
  await nextTick(); resetStepPosition()
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
        <header class="jb-header"><h2 id="jb-title" ref="heading" tabindex="-1"><span class="jb-desktop">{{ $t("Request a Trip") }}</span><span class="jb-mobile">{{ $t(mobileTitle) }}</span></h2><p class="jb-desktop">{{ $t("Tell us the details and we'll get in touch to confirm your booking.") }}</p><p class="jb-mobile">{{ $t("Step") }} {{ $t(state.currentStep) }} {{ $t("of 3") }}</p></header>
        <ol class="jb-stepper" :aria-label='$t("Booking progress")'><li v-for="(label, i) in ['Trip details', 'Contact details', 'Review & confirm']" :key="label" :class="{ reached: state.currentStep > i, current: state.currentStep === i + 1 }" :aria-current="state.currentStep === i + 1 ? 'step' : undefined"><span class="jb-marker"><JourneyIcon v-if="state.currentStep > i + 1" name="check" :size="20" /><template v-else>{{ $t(i + 1) }}</template></span><span>{{ $t(label) }}</span></li></ol>
        <form novalidate @submit.prevent="state.currentStep === 3 ? confirm() : next()">
          <JourneyBookingSummary v-if="state.currentStep < 3" class="jb-desktop-summary" :journey="journey" />
          <div v-if="state.currentStep === 1" class="jb-trip">
            <section><h3 class="jb-section-label"><JourneyIcon name="community" />{{ $t("Travelers") }}</h3><div class="jb-traveler-rows"><div v-for="[key, label, age, min] in travelers" :key="key" class="jb-traveler"><div>{{ $t(label) }}<small>{{ $t(age) }}</small></div><div class="jb-counter"><button type="button" :aria-label="$t(`Remove one ${label.toLowerCase()}`)" :disabled="state[key] <= min" @click="state[key]--"><JourneyIcon name="minus" :size="18" /></button><output :aria-label="$t(`${label} count`)" aria-live="polite">{{ $t(state[key]) }}</output><button type="button" :aria-label="$t(`Add one ${label.toLowerCase()}`)" @click="state[key]++"><JourneyIcon name="plus" :size="18" /></button></div></div></div><p v-if="errors.adults" class="jb-error">{{ $t(errors.adults) }}</p></section>
            <label class="jb-field jb-icon-field" for="jb-date"><span><JourneyIcon name="calendar" />{{ $t("Travel date") }}</span><input id="jb-date" v-model="state.travelDate" type="date" required :aria-invalid="!!errors.travelDate" :aria-describedby="errors.travelDate ? 'jb-date-error' : undefined" /><small v-if="errors.travelDate" id="jb-date-error" class="jb-error">{{ $t(errors.travelDate) }}</small></label>
            <label class="jb-field jb-icon-field" for="jb-country"><span><JourneyIcon name="pin" />{{ $t("Country") }}</span><span class="jb-country-control"><select id="jb-country" v-model="state.country" required :aria-invalid="!!errors.country" :aria-describedby="errors.country ? 'jb-country-error' : undefined"><option value="" disabled>{{ $t("Select a country") }}</option><option v-for="c in countries" :key="c.id" :value="c.id">{{ $t(c.flag) }} {{ $t(c.name) }}</option><option v-if="!countries.some(c => c.id === state.country)" :value="state.country">{{ $t(state.country) }}</option></select><JourneyIcon name="chevron-down" :size="20" /></span><small v-if="errors.country" id="jb-country-error" class="jb-error">{{ $t(errors.country) }}</small></label>
          </div>
          <div v-else-if="state.currentStep === 2" class="jb-contact">
            <div class="jb-contact-intro"><JourneyIcon name="person" :size="28" /><div><h3>{{ $t("Contact details") }}</h3><p>{{ $t("Let us know how to reach you.") }}</p></div></div>
            <label class="jb-field" for="jb-name"><span>{{ $t("Full name") }}</span><input id="jb-name" v-model="state.fullName" autocomplete="name" :placeholder='$t("e.g. John Smith")' required :aria-invalid="!!errors.fullName" :aria-describedby="errors.fullName ? 'jb-name-error' : undefined" /><small v-if="errors.fullName" id="jb-name-error" class="jb-error">{{ $t(errors.fullName) }}</small></label>
            <div class="jb-field"><label for="jb-phone">{{ $t("Phone number") }}</label><div class="jb-phone"><select v-model="state.phoneCountry" :aria-label='$t("Phone country and calling code")' @change="phoneCountryChanged"><option v-for="c in countries" :key="c.id" :value="c.id">{{ $t(c.flag) }} {{ $t(c.code) }} · {{ $t(c.name) }}</option></select><input id="jb-phone" v-model="state.phoneNumber" type="tel" inputmode="tel" autocomplete="tel-national" :placeholder='$t("e.g. 10 1234 5678")' required :aria-invalid="!!errors.phoneNumber" :aria-describedby="errors.phoneNumber ? 'jb-phone-error' : undefined" /></div><small v-if="errors.phoneNumber" id="jb-phone-error" class="jb-error">{{ $t(errors.phoneNumber) }}</small></div>
            <label class="jb-field" for="jb-email"><span>{{ $t("Email address") }} <span class="jb-optional">{{ $t("(optional)") }}</span></span><input id="jb-email" v-model="state.email" type="email" autocomplete="email" :placeholder='$t("e.g. john.smith@example.com")' :aria-invalid="!!errors.email" :aria-describedby="errors.email ? 'jb-email-error' : undefined" /><small v-if="errors.email" id="jb-email-error" class="jb-error">{{ $t(errors.email) }}</small></label>
          </div>
          <div v-else class="jb-review">
            <div class="jb-review-intro"><h3>{{ $t("Review your request") }}</h3><p>{{ $t("Please check your details below before submitting your request.") }}</p></div>
            <JourneyBookingSummary class="jb-mobile" :journey="journey" review />
            <section><div class="jb-review-heading"><h3><JourneyIcon name="calendar" />{{ $t("Trip details") }}</h3><button type="button" @click="go(1)">{{ $t("Edit") }}<span class="jb-sr-only"> {{ $t("trip details") }}</span></button></div><dl><div><dt>{{ $t("Date") }}</dt><dd>{{ $t(dateLabel) }}</dd></div><div><dt>{{ $t("Country") }}</dt><dd>{{ $t(countryName) }}</dd></div><div><dt>{{ $t("Travelers") }}</dt><dd><span class="jb-desktop">{{ $t(state.adults) }} {{ $t(state.adults === 1 ? 'adult' : 'adults') }}<template v-if="state.children">, {{ $t(state.children) }} {{ $t("children") }}</template><template v-if="state.infants">, {{ $t(state.infants) }} {{ $t("infants") }}</template></span><span class="jb-mobile">{{ $t(state.adults) }} {{ $t("Adults,") }} {{ $t(state.children) }} {{ $t("Children,") }} {{ $t(state.infants) }} {{ $t("Infants") }}</span></dd></div></dl></section>
            <section><div class="jb-review-heading"><h3><JourneyIcon name="person" />{{ $t("Contact details") }}</h3><button type="button" @click="go(2)">{{ $t("Edit") }}<span class="jb-sr-only"> {{ $t("contact details") }}</span></button></div><dl><div><dt>{{ $t("Full name") }}</dt><dd>{{ state.fullName }}</dd></div><div><dt>{{ $t("Phone number") }}</dt><dd>{{ state.phoneCode }} {{ state.phoneNumber }}</dd></div><div><dt>{{ $t("Email") }}</dt><dd>{{ $t(state.email || 'Not provided') }}</dd></div></dl></section>
          </div>
          <footer class="jb-actions"><button v-if="state.currentStep > 1" class="jd-button jb-back" type="button" @click="go(state.currentStep - 1)"><JourneyIcon name="arrow" />{{ $t("Back") }}</button><button class="jd-button jd-primary" type="submit">{{ $t(state.currentStep === 3 ? 'Confirm request' : 'Continue') }}<JourneyIcon name="arrow" /></button><button v-if="state.currentStep === 3" type="button" class="jd-button jb-mobile jb-edit-details" @click="go(1)">{{ $t("Edit details") }}</button></footer>
        </form>
      </div>
    </div>
  </dialog>
</template>
