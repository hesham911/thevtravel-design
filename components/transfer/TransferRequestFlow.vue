<script setup>
import { computed, nextTick, reactive, ref, watch, onMounted } from 'vue'
import { useRoute, useRuntimeConfig, useState } from '#imports'
import AppIcon from '../AppIcon.vue'
import { useI18n } from '~/utils/i18n'
const { translate, locale } = useI18n()
import JourneyIcon from '../journey/JourneyIcon.vue'
import { defineAsyncComponent } from 'vue'
const TransferMapPicker = defineAsyncComponent(() => import( './TransferMapPicker.vue'))
import { useRequestOverlay } from '~/composables/useRequestOverlay'
import TransferLocationField from './TransferLocationField.vue'
import { createLocationSearchService, useLocationSearchService } from '~/services/locationSearchService'
import { PHONE_NUMBER_PATTERN, TRAVELER_CATEGORIES, WAITING_MINUTES, serviceInstant, serviceToday, submitTransportationRequest } from '~/services/transportation'
import '~/assets/css/journey-booking.css'
import '~/assets/css/transfer-request.css'
const props = defineProps({ reverseGeocode: { type: Function, default: null }, searchLocations: { type: Function, default: null } })

// The address lookups both location fields and the map picker use.
//
// Configured by NUXT_PUBLIC_LOCATION_API_URL, which points at the API's own
// geocoding proxy (…/api/public/locations) rather than at a provider: the
// provider's usage policy wants one identifiable caller, the answers are
// cached there for every guest, and no credential is ever shipped to this
// page. With it unset, `searchAvailable` is false and every field says so
// instead of appearing to search and finding nothing.
//
// The injected callbacks still win where a caller supplies them — that is
// how the tests drive this without a network.
const configuredService = useLocationSearchService()
const locationService = props.searchLocations
  ? createLocationSearchService({ search: props.searchLocations })
  : configuredService
const emit = defineEmits(['request-draft'])
const dialog = ref(null), scrollArea = ref(null), heading = ref(null)
const { openOverlay, closeOverlay: close, overlayClosed } = useRequestOverlay(dialog)
const runtime = useRuntimeConfig().public
const step = ref(1), picker = ref(null), success = ref(false), errors = ref({}), submissionError = ref(''), submitting = ref(false), receipt = ref(null)
// `trip_type` holds the radio's label, which is also its i18n key; the
// services/transportation contract maps it to the API's own value.
// `luggage` has no counter in the form — the Travelers section asks for the
// three age categories only — and is held at 0 so the request still carries
// `luggage_count` and nothing downstream of it has to change.
const BLANK_FORM = Object.freeze({ pickup_address:'', pickup_latitude:null, pickup_longitude:null, dropoff_address:'', dropoff_longitude:null, dropoff_latitude:null, address_details:'', date:'', time:'', trip_type:'One way', return_date:'', return_time:'', return_dropoff_address:'', driver_waiting:false, waiting_minutes:'', adults:1, children:0, young_children:0, luggage:0, full_name:'', phone_country:'EG', phone_number:'', email:'', notes:'' })
const form = reactive({ ...BLANK_FORM })
const countries = [{id:'EG',name:'Egypt',code:'+20'},{id:'US',name:'United States',code:'+1'},{id:'GB',name:'United Kingdom',code:'+44'},{id:'DE',name:'Germany',code:'+49'},{id:'FR',name:'France',code:'+33'},{id:'AE',name:'United Arab Emirates',code:'+971'},{id:'SA',name:'Saudi Arabia',code:'+966'}]
const phoneCode = computed(() => countries.find(c => c.id === form.phone_country).code)
const title = computed(() => picker.value ? `Select ${picker.value === 'pickup' ? 'pickup' : 'drop-off'} location` : 'Request a transfer')
const isReturn = computed(() => form.trip_type === 'Return')
// The driving happens in Egypt, so "today" and every time the guest picks
// are read in the service's zone, never the browser's.
const today = useState('transfer-today', serviceToday)
onMounted(() => { today.value = serviceToday() })
// A return leg and a waiting duration are prohibited on a one-way request,
// not ignored, so switching back drops what the guest had filled in rather
// than carrying it into a payload the API would reject.
watch(isReturn, (value) => { if (!value) Object.assign(form, { return_date:'', return_time:'', return_dropoff_address:'', driver_waiting:false, waiting_minutes:'' }) })
watch(() => form.driver_waiting, (value) => { if (!value) form.waiting_minutes = '' })
async function resetPosition() { await nextTick(); heading.value?.focus({preventScroll:true}); scrollArea.value?.scrollTo({top:0,behavior:'instant'}) }
async function open() { step.value=1; picker.value=null; success.value=false; errors.value={}; submissionError.value=''; receipt.value=null; await openOverlay(); resetPosition() }
function go(value) { step.value=value; errors.value={}; resetPosition() }
function openPicker(field) { picker.value=field; resetPosition() }
function confirmLocation(location) { if (!picker.value || !location.address?.trim()) return; selectLocation(picker.value, location); picker.value=null; resetPosition() }
// One path for every way a location is chosen — a search result in step 1 or
// a confirmed point on the map — so the address and its coordinates are
// always written together and can never disagree.
function selectLocation(field, location) {
  form[`${field}_address`] = location.address
  form[`${field}_latitude`] = location.latitude
  form[`${field}_longitude`] = location.longitude
  errors.value = { ...errors.value, [`${field}_address`]: undefined }
}
// Typing by hand invalidates the point the old text came with: an address
// the guest edited is no longer the place that pin named.
function manualAddress(field, value) { form[`${field}_address`]=value; form[`${field}_latitude`]=null; form[`${field}_longitude`]=null }
async function validate(value) {
  const e={}
  if(value===1) {
    for (const field of ['pickup', 'dropoff']) {
      if (!form[`${field}_address`].trim()) e[`${field}_address`] = 'Enter an address or select a location on the map.'
    }
    for (const key of ['date', 'time']) if (!form[key].trim()) e[key] = 'Please complete this field.'
    if(form.date && form.date<today.value) e.date='Choose today or a future date.'
    // The API requires a pickup after now, which a date of today and a time
    // already past is not.
    const pickup = serviceInstant(form.date, form.time)
    if(!e.date && !e.time && pickup && pickup.epochMs<=Date.now()) e.time='Choose a pickup time in the future.'
    if(isReturn.value) {
      for (const key of ['return_date', 'return_time']) if (!form[key].trim()) e[key] = 'Please complete this field.'
      const leg = serviceInstant(form.return_date, form.return_time)
      if(!e.return_date && !e.return_time && leg && pickup && leg.epochMs<=pickup.epochMs) e.return_time='Choose a return time after the pickup time.'
      if(form.driver_waiting && String(form.waiting_minutes).trim()!=='') {
        const minutes=Number(form.waiting_minutes)
        if(!Number.isInteger(minutes) || minutes<WAITING_MINUTES.min || minutes>WAITING_MINUTES.max) e.waiting_minutes=translate('Enter a waiting time between {min} and {max} minutes, or leave it blank.',WAITING_MINUTES)
      }
    }
  } else {
    if(!form.full_name.trim()) e.full_name='Enter your full name.'
    // The API's own rule on the national number: digits, spaces and
    // hyphens, a digit first, six to twenty characters.
    if(!PHONE_NUMBER_PATTERN.test(form.phone_number.trim().replace(/\s+/g,' '))) e.phone_number='Enter a valid phone number.'
    if(form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email='Enter a valid email address, or leave it blank.'
  }
  errors.value=e
  if(Object.keys(e).length) { await nextTick(); dialog.value.querySelector('[aria-invalid="true"]')?.focus(); return false }
  return true
}
async function next() { if(await validate(step.value)) go(step.value+1) }
const STATUS_MESSAGE = Object.freeze({
  invalid: 'Please review the highlighted fields.',
  throttled: 'Too many requests from this device. Please wait a minute and try again.',
  demo: 'Requests cannot be sent right now. Please contact us on WhatsApp instead.',
  error: 'Your request could not be sent. Please check your connection and try again.',
})
// The step a rejected field lives on, so a 422 lands the guest where they
// can fix it instead of on the review they cannot edit.
const FIELD_STEP = Object.freeze({ full_name:2, phone_number:2, email:2, notes:2 })
async function confirm() {
  if(submitting.value) return
  for(const value of [1,2]) if(!await validate(value)) { step.value=value; return }
  submitting.value=true; submissionError.value=''
  try {
    const result = await submitTransportationRequest(runtime.apiBaseUrl, form, phoneCode.value, locale.value)
    if(result.status==='ok') {
      receipt.value={ reference:result.reference, pending:result.bookingStatus==='pending' }
      emit('request-draft',{ reference:result.reference, submitted_at:result.submittedAt })
      // Only a recorded request clears the form; every other outcome keeps
      // what the guest typed, so a retry costs them nothing.
      Object.assign(form,BLANK_FORM)
      success.value=true; step.value=1; resetPosition(); return
    }
    submissionError.value=STATUS_MESSAGE[result.status] ?? STATUS_MESSAGE.error
    if(result.status==='invalid') {
      errors.value=result.errors
      const target=Object.keys(result.errors).map(field => FIELD_STEP[field] ?? 1).sort()[0]
      step.value=target
      await nextTick(); dialog.value?.querySelector('[aria-invalid="true"]')?.focus()
    }
  } finally { submitting.value=false }
}
const waitingSummary = computed(() => form.driver_waiting ? (String(form.waiting_minutes).trim()==='' ? 'Yes' : translate('{minutes} minutes',{minutes:form.waiting_minutes})) : 'No')
// [label, value, translate the value?]
const tripReview = computed(() => [
  ['Pickup location', form.pickup_address || 'Address unavailable', !form.pickup_address],
  ['Drop-off location', form.dropoff_address || 'Address unavailable', !form.dropoff_address],
  ['Address details', form.address_details || 'Not provided', !form.address_details],
  ['Date', form.date, false], ['Time', form.time, false], ['Trip type', form.trip_type, true],
  ...(isReturn.value ? [
    ['Return date', form.return_date, false], ['Return time', form.return_time, false],
    ['Return drop-off location', form.return_dropoff_address || 'Same as pickup location', !form.return_dropoff_address],
    ['Driver waiting', waitingSummary.value, !form.driver_waiting || String(form.waiting_minutes).trim()===''],
  ] : []),
  // The same three rows the counters asked for, in the same order and with
  // the age that defines each one, read back from the same list: the review
  // cannot drift from the form, and a guest can see nobody was counted
  // twice. Luggage is not a traveller and no longer has a counter, so it is
  // not read back here either.
  ['Travelers', TRAVELER_CATEGORIES.map(row => `${form[row.key]} ${translate(row.label)}`).join(', '), false],
])
const contactReview = computed(() => [
  ['Full name', form.full_name, false], ['Phone number', `${phoneCode.value} ${form.phone_number}`, false],
  ['Email', form.email || 'Not provided', !form.email], ['Special requests', form.notes || 'None', !form.notes],
])
const route=useRoute()
watch(() => route.path, close)
defineExpose({open})
</script>
<template>
  <dialog ref="dialog" class="jb-dialog tf-dialog" aria-labelledby="tf-title" @close="overlayClosed" @click="($event.target === dialog) && close()">
    <div class="jb-panel"><span class="jb-handle" aria-hidden="true"></span>
      <button v-if="picker" class="tf-map-back" type="button" :aria-label='$t("Back to trip details")' @click="picker=null; resetPosition()"><AppIcon name="chevron-left" :size="24" /></button>
      <button class="jb-close" type="button" :aria-label='$t("Close transfer request")' @click="close"><AppIcon name="close" :size="24" /></button>
      <div ref="scrollArea" class="jb-scroll">
        <template v-if="success"><div class="tf-success" role="status"><span class="tf-success-icon"><JourneyIcon name="check" :size="50" /></span><h2 id="tf-title" ref="heading" tabindex="-1">{{ $t("Transfer request sent") }}</h2>
          <div v-if="receipt" class="tf-reference"><small>{{ $t("Your reference") }}</small><strong>{{ receipt.reference }}</strong><span v-if="receipt.pending">{{ $t("Pending review") }}</span></div>
          <p>{{ $t("We will review your request and get back to you shortly with availability and price.") }}</p>
          <p>{{ $t("Nothing is booked yet. TheVTravel will contact you to confirm availability, your trip details and the final price in USD.") }}</p>
          <button class="tf-primary" type="button" @click="close">{{ $t("Close") }}</button></div></template>
        <template v-else><header class="jb-header"><h2 id="tf-title" ref="heading" tabindex="-1">{{ $t(title) }}</h2><p v-if="!picker">{{ $t("Tell us the details and we'll get in touch to confirm your booking.") }}</p></header>
          <ClientOnly v-if="picker"><TransferMapPicker :location-type="picker" :latitude="form[`${picker}_latitude`]" :longitude="form[`${picker}_longitude`]" :address="form[`${picker}_address`]" :reverse-geocode="props.reverseGeocode" :search-locations="props.searchLocations" @confirm="confirmLocation" /></ClientOnly>
          <template v-else><ol class="jb-stepper" :aria-label='$t("Transfer request progress")'><li v-for="(label,i) in ['Route & trip details','Contact details','Review & confirm']" :key="label" :class="{reached:step>i,current:step===i+1}" :aria-current="step===i+1 ? 'step' : undefined"><span class="jb-marker"><JourneyIcon v-if="step>i+1" name="check" :size="20" /><template v-else>{{ $t(i+1) }}</template></span><span>{{ $t(label) }}</span></li></ol>
            <form novalidate @submit.prevent="step===3 ? confirm() : next()">
              <div v-if="step===1">
                <TransferLocationField v-for="[field,label] in [['pickup','Pickup location'],['dropoff','Drop-off location']]" :key="field" :field="field" :label="label" :address="form[`${field}_address`]" :latitude="form[`${field}_latitude`]" :error="errors[`${field}_address`] || ''" :service="locationService" :language="locale" @update:address="manualAddress(field, $event)" @select="selectLocation(field, $event)" @open-map="openPicker(field)" />
                <label class="jb-field" for="tf-address-details"><span>{{ $t("Address / hotel / landmark details") }} <small class="jb-optional">{{ $t("(optional)") }}</small></span><input id="tf-address-details" v-model="form.address_details" :placeholder='$t("Terminal, hotel entrance, room number…")' /></label>
                <div class="tf-two-columns"><label v-for="field in ['date','time']" :key="field" class="jb-field" :for="`tf-${field}`"><span>{{ $t(field==='date' ? 'Date' : 'Time') }}</span><input :id="`tf-${field}`" v-model="form[field]" :type="field" :min="field==='date' ? today : undefined" required :aria-invalid="!!errors[field]" :aria-describedby="errors[field] ? `tf-${field}-error` : undefined" /><small v-if="errors[field]" :id="`tf-${field}-error`" class="jb-error">{{ $t(errors[field]) }}</small></label></div>
                <p class="tf-timezone">{{ $t("All times are local to Egypt.") }}</p>
                <fieldset class="tf-trip-type"><legend>{{ $t("Trip type") }}</legend><label v-for="type in ['One way','Return']" :key="type"><input v-model="form.trip_type" type="radio" :value="type" name="trip-type" />{{ $t(type) }}</label></fieldset>
                <section v-if="isReturn" class="tf-return"><h3 class="jb-section-label">{{ $t("Return journey") }}</h3>
                  <div class="tf-two-columns"><label v-for="[field,label,type] in [['return_date','Return date','date'],['return_time','Return time','time']]" :key="field" class="jb-field" :for="`tf-${field}`"><span>{{ $t(label) }}</span><input :id="`tf-${field}`" v-model="form[field]" :type="type" :min="type==='date' ? (form.date || today) : undefined" :aria-invalid="!!errors[field]" :aria-describedby="errors[field] ? `tf-${field}-error` : undefined" /><small v-if="errors[field]" :id="`tf-${field}-error`" class="jb-error">{{ $t(errors[field]) }}</small></label></div>
                  <label class="jb-field" for="tf-return-dropoff"><span>{{ $t("Return drop-off location") }} <small class="jb-optional">{{ $t("(optional)") }}</small></span><input id="tf-return-dropoff" v-model="form.return_dropoff_address" :placeholder='$t("Same as pickup location")' /></label>
                  <label class="tf-waiting" for="tf-driver-waiting"><input id="tf-driver-waiting" v-model="form.driver_waiting" type="checkbox" /><span>{{ $t("Ask the driver to wait between the two legs") }}</span></label>
                  <label v-if="form.driver_waiting" class="jb-field" for="tf-waiting-minutes"><span>{{ $t("Estimated waiting time (minutes)") }} <small class="jb-optional">{{ $t("(optional)") }}</small></span><input id="tf-waiting-minutes" v-model="form.waiting_minutes" type="number" inputmode="numeric" :min="WAITING_MINUTES.min" :max="WAITING_MINUTES.max" step="5" :placeholder='$t("We can agree this on the phone")' :aria-invalid="!!errors.waiting_minutes" :aria-describedby="errors.waiting_minutes ? 'tf-waiting-error' : undefined" /><small v-if="errors.waiting_minutes" id="tf-waiting-error" class="jb-error">{{ $t(errors.waiting_minutes) }}</small></label>
                </section>
                <section class="tf-travelers"><h3 class="jb-section-label">{{ $t("Travelers") }}</h3><div v-for="row in TRAVELER_CATEGORIES" :key="row.key" class="jb-traveler"><span>{{ $t(row.label) }}</span><div class="jb-counter"><button type="button" :disabled="form[row.key]<=row.min" :aria-label="$t(`Remove one ${row.single}`)" @click="form[row.key]--"><JourneyIcon name="minus" :size="18" /></button><output :aria-label="$t(`${row.label} count`)" aria-live="polite">{{ $t(form[row.key]) }}</output><button type="button" :disabled="form[row.key]>=row.max" :aria-label="$t(`Add one ${row.single}`)" @click="form[row.key]++"><JourneyIcon name="plus" :size="18" /></button></div></div></section>
              </div>
              <div v-else-if="step===2"><h3 class="tf-section-title">{{ $t("Contact details") }}</h3>
                <label class="jb-field" for="tf-name"><span>{{ $t("Full name") }}</span><input id="tf-name" v-model="form.full_name" autocomplete="name" required :aria-invalid="!!errors.full_name" aria-describedby="tf-name-error" /><small v-if="errors.full_name" id="tf-name-error" class="jb-error">{{ $t(errors.full_name) }}</small></label>
                <div class="jb-field"><label for="tf-phone">{{ $t("Phone number") }}</label><div class="tf-phone"><select v-model="form.phone_country" :aria-label='$t("Phone country")'><option v-for="country in countries" :key="country.id" :value="country.id">{{ $t(country.name) }}</option></select><span>{{ phoneCode }}</span><input id="tf-phone" v-model="form.phone_number" type="tel" autocomplete="tel-national" :placeholder='$t("Phone number")' required :aria-invalid="!!errors.phone_number" aria-describedby="tf-phone-error" /></div><small v-if="errors.phone_number" id="tf-phone-error" class="jb-error">{{ $t(errors.phone_number) }}</small></div>
                <label class="jb-field" for="tf-email"><span>{{ $t("Email address") }} <small class="jb-optional">{{ $t("(optional)") }}</small></span><input id="tf-email" v-model="form.email" type="email" autocomplete="email" :aria-invalid="!!errors.email" aria-describedby="tf-email-error" /><small v-if="errors.email" id="tf-email-error" class="jb-error">{{ $t(errors.email) }}</small></label>
                <label class="jb-field" for="tf-notes"><span>{{ $t("Special requests / notes") }} <small class="jb-optional">{{ $t("(optional)") }}</small></span><textarea id="tf-notes" v-model="form.notes" rows="4" :placeholder='$t("Flight number, child seat, extra luggage, extra stops...")'></textarea><small v-if="errors.notes" class="jb-error">{{ $t(errors.notes) }}</small></label>
              </div>
              <div v-else class="jb-review"><div class="jb-review-intro"><h3>{{ $t("Review your request") }}</h3><p>{{ $t("Please check your details below before submitting your request.") }}</p></div>
                <section><div class="jb-review-heading"><h3>{{ $t("Trip details") }}</h3><button type="button" :aria-label='$t("Edit trip details")' @click="go(1)">{{ $t("Edit") }}</button></div><dl><div v-for="[label,value,translatable] in tripReview" :key="label"><dt>{{ $t(label) }}</dt><dd>{{ translatable ? $t(value) : value }}</dd></div></dl></section>
                <section><div class="jb-review-heading"><h3>{{ $t("Contact details") }}</h3><button type="button" :aria-label='$t("Edit contact details")' @click="go(2)">{{ $t("Edit") }}</button></div><dl><div v-for="[label,value,translatable] in contactReview" :key="label"><dt>{{ $t(label) }}</dt><dd>{{ translatable ? $t(value) : value }}</dd></div></dl></section>
                <p class="tf-pending-note">{{ $t("Submitting this form sends a request. Nothing is booked until our team confirms it with you.") }}</p>
              </div>
              <p v-if="submissionError" class="jb-error" role="alert">{{ $t(submissionError) }}</p>
              <footer class="jb-actions"><button v-if="step>1" class="tf-secondary" type="button" @click="go(step-1)">{{ $t("Back") }}</button><button class="tf-primary" type="submit" :disabled="submitting">{{ $t(submitting ? 'Submitting…' : step===3 ? 'Confirm request' : 'Continue') }}<AppIcon name="arrow" :size="18" /></button></footer>
            </form>
          </template>
        </template>
      </div>
    </div>
  </dialog>
</template>
