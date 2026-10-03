<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import JourneyIcon from './JourneyIcon.vue'
import JourneyBookingSummary from './JourneyBookingSummary.vue'
import '../../journey-booking.css'
import { useRequestOverlay } from '../../composables/useRequestOverlay'
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
const dateLabel = computed(() => state.travelDate ? new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${state.travelDate}T12:00:00`)) : '')
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
      <button class="jb-close" type="button" aria-label="Close booking request" @click="close"><JourneyIcon name="close" :size="26" /></button>
      <div ref="scrollArea" class="jb-scroll">
        <header class="jb-header"><h2 id="jb-title" ref="heading" tabindex="-1"><span class="jb-desktop">Request a Trip</span><span class="jb-mobile">{{ mobileTitle }}</span></h2><p class="jb-desktop">Tell us the details and we'll get in touch to confirm your booking.</p><p class="jb-mobile">Step {{ state.currentStep }} of 3</p></header>
        <ol class="jb-stepper" aria-label="Booking progress"><li v-for="(label, i) in ['Trip details', 'Contact details', 'Review & confirm']" :key="label" :class="{ reached: state.currentStep > i, current: state.currentStep === i + 1 }" :aria-current="state.currentStep === i + 1 ? 'step' : undefined"><span class="jb-marker"><JourneyIcon v-if="state.currentStep > i + 1" name="check" :size="20" /><template v-else>{{ i + 1 }}</template></span><span>{{ label }}</span></li></ol>
        <form novalidate @submit.prevent="state.currentStep === 3 ? confirm() : next()">
          <JourneyBookingSummary v-if="state.currentStep < 3" class="jb-desktop-summary" :journey="journey" />
          <div v-if="state.currentStep === 1" class="jb-trip">
            <section><h3 class="jb-section-label"><JourneyIcon name="community" />Travelers</h3><div class="jb-traveler-rows"><div v-for="[key, label, age, min] in travelers" :key="key" class="jb-traveler"><div>{{ label }}<small>{{ age }}</small></div><div class="jb-counter"><button type="button" :aria-label="`Remove one ${label.toLowerCase()}`" :disabled="state[key] <= min" @click="state[key]--">−</button><output :aria-label="`${label} count`" aria-live="polite">{{ state[key] }}</output><button type="button" :aria-label="`Add one ${label.toLowerCase()}`" @click="state[key]++">+</button></div></div></div><p v-if="errors.adults" class="jb-error">{{ errors.adults }}</p></section>
            <label class="jb-field jb-icon-field" for="jb-date"><span><JourneyIcon name="calendar" />Travel date</span><input id="jb-date" v-model="state.travelDate" type="date" required :aria-invalid="!!errors.travelDate" :aria-describedby="errors.travelDate ? 'jb-date-error' : undefined" /><small v-if="errors.travelDate" id="jb-date-error" class="jb-error">{{ errors.travelDate }}</small></label>
            <label class="jb-field jb-icon-field" for="jb-country"><span><JourneyIcon name="pin" />Country</span><span class="jb-country-control"><select id="jb-country" v-model="state.country" required :aria-invalid="!!errors.country" :aria-describedby="errors.country ? 'jb-country-error' : undefined"><option value="" disabled>Select a country</option><option v-for="c in countries" :key="c.id" :value="c.id">{{ c.flag }} {{ c.name }}</option><option v-if="!countries.some(c => c.id === state.country)" :value="state.country">{{ state.country }}</option></select><JourneyIcon name="chevron-down" :size="20" /></span><small v-if="errors.country" id="jb-country-error" class="jb-error">{{ errors.country }}</small></label>
          </div>
          <div v-else-if="state.currentStep === 2" class="jb-contact">
            <div class="jb-contact-intro"><JourneyIcon name="person" :size="28" /><div><h3>Contact details</h3><p>Let us know how to reach you.</p></div></div>
            <label class="jb-field" for="jb-name"><span>Full name</span><input id="jb-name" v-model="state.fullName" autocomplete="name" placeholder="e.g. John Smith" required :aria-invalid="!!errors.fullName" :aria-describedby="errors.fullName ? 'jb-name-error' : undefined" /><small v-if="errors.fullName" id="jb-name-error" class="jb-error">{{ errors.fullName }}</small></label>
            <div class="jb-field"><label for="jb-phone">Phone number</label><div class="jb-phone"><select v-model="state.phoneCountry" aria-label="Phone country and calling code" @change="phoneCountryChanged"><option v-for="c in countries" :key="c.id" :value="c.id">{{ c.flag }} {{ c.code }} · {{ c.name }}</option></select><input id="jb-phone" v-model="state.phoneNumber" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="e.g. 10 1234 5678" required :aria-invalid="!!errors.phoneNumber" :aria-describedby="errors.phoneNumber ? 'jb-phone-error' : undefined" /></div><small v-if="errors.phoneNumber" id="jb-phone-error" class="jb-error">{{ errors.phoneNumber }}</small></div>
            <label class="jb-field" for="jb-email"><span>Email address <span class="jb-optional">(optional)</span></span><input id="jb-email" v-model="state.email" type="email" autocomplete="email" placeholder="e.g. john.smith@example.com" :aria-invalid="!!errors.email" :aria-describedby="errors.email ? 'jb-email-error' : undefined" /><small v-if="errors.email" id="jb-email-error" class="jb-error">{{ errors.email }}</small></label>
          </div>
          <div v-else class="jb-review">
            <div class="jb-review-intro"><h3>Review your request</h3><p>Please check your details below before submitting your request.</p></div>
            <JourneyBookingSummary class="jb-mobile" :journey="journey" review />
            <section><div class="jb-review-heading"><h3><JourneyIcon name="calendar" />Trip details</h3><button type="button" @click="go(1)">Edit<span class="jb-sr-only"> trip details</span></button></div><dl><div><dt>Date</dt><dd>{{ dateLabel }}</dd></div><div><dt>Country</dt><dd>{{ countryName }}</dd></div><div><dt>Travelers</dt><dd><span class="jb-desktop">{{ state.adults }} {{ state.adults === 1 ? 'adult' : 'adults' }}<template v-if="state.children">, {{ state.children }} children</template><template v-if="state.infants">, {{ state.infants }} infants</template></span><span class="jb-mobile">{{ state.adults }} Adults, {{ state.children }} Children, {{ state.infants }} Infants</span></dd></div></dl></section>
            <section><div class="jb-review-heading"><h3><JourneyIcon name="person" />Contact details</h3><button type="button" @click="go(2)">Edit<span class="jb-sr-only"> contact details</span></button></div><dl><div><dt>Full name</dt><dd>{{ state.fullName }}</dd></div><div><dt>Phone number</dt><dd>{{ state.phoneCode }} {{ state.phoneNumber }}</dd></div><div><dt>Email</dt><dd>{{ state.email || 'Not provided' }}</dd></div></dl></section>
          </div>
          <footer class="jb-actions"><button v-if="state.currentStep > 1" class="jd-button jb-back" type="button" @click="go(state.currentStep - 1)"><JourneyIcon name="arrow" />Back</button><button class="jd-button jd-primary" type="submit">{{ state.currentStep === 3 ? 'Confirm request' : 'Continue' }}<JourneyIcon name="arrow" /></button><button v-if="state.currentStep === 3" type="button" class="jd-button jb-mobile jb-edit-details" @click="go(1)">Edit details</button></footer>
        </form>
      </div>
    </div>
  </dialog>
</template>
