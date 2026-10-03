<script setup>
import { computed, nextTick, reactive, ref, watch, onMounted } from 'vue'
import { useRoute } from '#imports'
import AppIcon from '../AppIcon.vue'
import { useI18n } from '~/utils/i18n'
const { translate } = useI18n()
import JourneyIcon from '../journey/JourneyIcon.vue'
import { defineAsyncComponent } from 'vue'
const TransferMapPicker = defineAsyncComponent(() => import( './TransferMapPicker.vue'))
import { useRequestOverlay } from '~/composables/useRequestOverlay'
import '~/assets/css/journey-booking.css'
import '~/assets/css/transfer-request.css'
const props = defineProps({ reverseGeocode: { type: Function, default: null }, searchLocations: { type: Function, default: null } })
const emit = defineEmits(['request-draft'])
const dialog = ref(null), scrollArea = ref(null), heading = ref(null)
const { openOverlay, closeOverlay: close, overlayClosed } = useRequestOverlay(dialog)
const step = ref(1), picker = ref(null), success = ref(false), errors = ref({}), submissionError = ref(''), submitting = ref(false)
const form = reactive({ pickup_address:'', pickup_latitude:null, pickup_longitude:null, dropoff_address:'', dropoff_latitude:null, dropoff_longitude:null, address_details:'', date:'', time:'', trip_type:'One way', adults:1, children:0, infants:0, full_name:'', phone_country:'EG', phone_number:'', email:'', notes:'' })
const countries = [{id:'EG',name:'Egypt',code:'+20'},{id:'US',name:'United States',code:'+1'},{id:'GB',name:'United Kingdom',code:'+44'},{id:'DE',name:'Germany',code:'+49'},{id:'FR',name:'France',code:'+33'},{id:'AE',name:'United Arab Emirates',code:'+971'},{id:'SA',name:'Saudi Arabia',code:'+966'}]
const phoneCode = computed(() => countries.find(c => c.id === form.phone_country).code)
const title = computed(() => picker.value ? `Select ${picker.value === 'pickup' ? 'pickup' : 'drop-off'} location` : 'Request a transfer')
function localToday() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}` }
const today = useState('transfer-today', localToday)
onMounted(() => { today.value = localToday() })
async function resetPosition() { await nextTick(); heading.value?.focus({preventScroll:true}); scrollArea.value?.scrollTo({top:0,behavior:'instant'}) }
async function open() { step.value=1; picker.value=null; success.value=false; errors.value={}; submissionError.value=''; await openOverlay(); resetPosition() }
function go(value) { step.value=value; errors.value={}; resetPosition() }
function openPicker(field) { picker.value=field; resetPosition() }
function confirmLocation(location) { if (!picker.value || !location.address?.trim()) return; const field=picker.value; form[`${field}_latitude`]=location.latitude; form[`${field}_longitude`]=location.longitude; form[`${field}_address`]=location.address; picker.value=null; resetPosition() }
function manualAddress(field) { form[`${field}_latitude`]=null; form[`${field}_longitude`]=null }
async function validate(value) {
  const e={}
  if(value===1) {
    for (const field of ['pickup', 'dropoff']) {
      if (!form[`${field}_address`].trim()) e[`${field}_address`] = 'Enter an address or select a location on the map.'
    }
    for (const key of ['date', 'time']) if (!form[key].trim()) e[key] = 'Please complete this field.'
    if(form.date && form.date<today.value) e.date='Choose today or a future date.'
  } else {
    if(!form.full_name.trim()) e.full_name='Enter your full name.'
    if(!/^[\d\s().-]{5,30}$/.test(form.phone_number) || form.phone_number.replace(/\D/g,'').length<5 || form.phone_number.replace(/\D/g,'').length>15) e.phone_number='Enter a valid phone number.'
    if(form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email='Enter a valid email address, or leave it blank.'
  }
  errors.value=e
  if(Object.keys(e).length) { await nextTick(); dialog.value.querySelector('[aria-invalid="true"]')?.focus(); return false }
  return true
}
async function next() { if(await validate(step.value)) go(step.value+1) }
// Frontend adapter: persist a local request until a server endpoint is configured.
async function submitRequest(payload) {
  const requests=JSON.parse(localStorage.getItem('thevtravel-transfer-requests') || '[]')
  requests.push(payload)
  localStorage.setItem('thevtravel-transfer-requests',JSON.stringify(requests))
  emit('request-draft',payload)
}
async function confirm() {
  for(const value of [1,2]) if(!await validate(value)) { step.value=value; return }
  submitting.value=true; submissionError.value=''
  try { await submitRequest({ ...form, phone_code:phoneCode.value, full_name:form.full_name.trim(), email:form.email.trim(), requested_at:new Date().toISOString() }); success.value=true; resetPosition() }
  catch { submissionError.value='Your request could not be saved. Please try again.' }
  finally { submitting.value=false }
}
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
        <template v-if="success"><div class="tf-success" role="status"><span class="tf-success-icon"><JourneyIcon name="check" :size="50" /></span><h2 id="tf-title" ref="heading" tabindex="-1">{{ $t("Transfer request sent") }}</h2><p>{{ $t("We will review your request and get back to you shortly with availability and price.") }}</p><button class="tf-primary" type="button" @click="close">{{ $t("Close") }}</button></div></template>
        <template v-else><header class="jb-header"><h2 id="tf-title" ref="heading" tabindex="-1">{{ $t(title) }}</h2><p v-if="!picker">{{ $t("Tell us the details and we'll get in touch to confirm your booking.") }}</p></header>
          <ClientOnly v-if="picker"><TransferMapPicker :location-type="picker" :latitude="form[`${picker}_latitude`]" :longitude="form[`${picker}_longitude`]" :address="form[`${picker}_address`]" :reverse-geocode="props.reverseGeocode" :search-locations="props.searchLocations" @confirm="confirmLocation" /></ClientOnly>
          <template v-else><ol class="jb-stepper" :aria-label='$t("Transfer request progress")'><li v-for="(label,i) in ['Route & trip details','Contact details','Review & confirm']" :key="label" :class="{reached:step>i,current:step===i+1}" :aria-current="step===i+1 ? 'step' : undefined"><span class="jb-marker"><JourneyIcon v-if="step>i+1" name="check" :size="20" /><template v-else>{{ $t(i+1) }}</template></span><span>{{ $t(label) }}</span></li></ol>
            <form novalidate @submit.prevent="step===3 ? confirm() : next()">
              <div v-if="step===1">
                <div v-for="[field,label] in [['pickup','Pickup location'],['dropoff','Drop-off location']]" :key="field" class="jb-field"><label :for="`tf-${field}`">{{ $t(label) }}</label><div class="tf-location"><input :id="`tf-${field}`" v-model="form[`${field}_address`]" :placeholder="$t(form[`${field}_latitude`] != null ? 'Address unavailable — enter an address if known' : 'Address, hotel or landmark')" :aria-invalid="!!errors[`${field}_address`]" :aria-describedby="errors[`${field}_address`] ? `tf-${field}-error` : undefined" @input="manualAddress(field)" /><button type="button" :aria-label="$t(`Select ${label.toLowerCase()} on map`)" @click="openPicker(field)"><AppIcon name="map" :size="22" /></button></div><small v-if="errors[`${field}_address`]" :id="`tf-${field}-error`" class="jb-error">{{ $t(errors[`${field}_address`]) }}</small></div>
                <label class="jb-field" for="tf-address-details"><span>{{ $t("Address / hotel / landmark details") }} <small class="jb-optional">{{ $t("(optional)") }}</small></span><input id="tf-address-details" v-model="form.address_details" :placeholder='$t("Terminal, hotel entrance, room number…")' /></label>
                <div class="tf-two-columns"><label v-for="field in ['date','time']" :key="field" class="jb-field" :for="`tf-${field}`"><span>{{ $t(field==='date' ? 'Date' : 'Time') }}</span><input :id="`tf-${field}`" v-model="form[field]" :type="field" :min="field==='date' ? today : undefined" required :aria-invalid="!!errors[field]" :aria-describedby="errors[field] ? `tf-${field}-error` : undefined" /><small v-if="errors[field]" :id="`tf-${field}-error`" class="jb-error">{{ $t(errors[field]) }}</small></label></div>
                <fieldset class="tf-trip-type"><legend>{{ $t("Trip type") }}</legend><label v-for="type in ['One way','Return']" :key="type"><input v-model="form.trip_type" type="radio" :value="type" name="trip-type" />{{ $t(type) }}</label></fieldset>
                <section class="tf-travelers"><h3 class="jb-section-label">{{ $t("Travelers") }}</h3><div v-for="[key,label,min] in [['adults','Adults',1],['children','Children',0],['infants','Infants',0]]" :key="key" class="jb-traveler"><span>{{ $t(label) }}</span><div class="jb-counter"><button type="button" :disabled="form[key]<=min" :aria-label="$t(`Remove one ${label.toLowerCase()}`)" @click="form[key]--"><JourneyIcon name="minus" :size="18" /></button><output :aria-label="$t(`${label} count`)" aria-live="polite">{{ $t(form[key]) }}</output><button type="button" :disabled="form[key]>=99" :aria-label="$t(`Add one ${label.toLowerCase()}`)" @click="form[key]++"><JourneyIcon name="plus" :size="18" /></button></div></div></section>
              </div>
              <div v-else-if="step===2"><h3 class="tf-section-title">{{ $t("Contact details") }}</h3>
                <label class="jb-field" for="tf-name"><span>{{ $t("Full name") }}</span><input id="tf-name" v-model="form.full_name" autocomplete="name" required :aria-invalid="!!errors.full_name" aria-describedby="tf-name-error" /><small v-if="errors.full_name" id="tf-name-error" class="jb-error">{{ $t(errors.full_name) }}</small></label>
                <div class="jb-field"><label for="tf-phone">{{ $t("Phone number") }}</label><div class="tf-phone"><select v-model="form.phone_country" :aria-label='$t("Phone country")'><option v-for="country in countries" :key="country.id" :value="country.id">{{ $t(country.name) }}</option></select><span>{{ phoneCode }}</span><input id="tf-phone" v-model="form.phone_number" type="tel" autocomplete="tel-national" :placeholder='$t("Phone number")' required :aria-invalid="!!errors.phone_number" aria-describedby="tf-phone-error" /></div><small v-if="errors.phone_number" id="tf-phone-error" class="jb-error">{{ $t(errors.phone_number) }}</small></div>
                <label class="jb-field" for="tf-email"><span>{{ $t("Email address") }} <small class="jb-optional">{{ $t("(optional)") }}</small></span><input id="tf-email" v-model="form.email" type="email" autocomplete="email" :aria-invalid="!!errors.email" aria-describedby="tf-email-error" /><small v-if="errors.email" id="tf-email-error" class="jb-error">{{ $t(errors.email) }}</small></label>
                <label class="jb-field" for="tf-notes"><span>{{ $t("Special requests / notes") }} <small class="jb-optional">{{ $t("(optional)") }}</small></span><textarea id="tf-notes" v-model="form.notes" rows="4" :placeholder='$t("Flight number, child seat, extra luggage, extra stops...")'></textarea></label>
              </div>
              <div v-else class="jb-review"><div class="jb-review-intro"><h3>{{ $t("Review your request") }}</h3><p>{{ $t("Please check your details below before submitting your request.") }}</p></div>
                <section><div class="jb-review-heading"><h3>{{ $t("Trip details") }}</h3><button type="button" :aria-label='$t("Edit trip details")' @click="go(1)">{{ $t("Edit") }}</button></div><dl><div v-for="[label,value] in [['Pickup location',form.pickup_address || 'Address unavailable'],['Drop-off location',form.dropoff_address || 'Address unavailable'],['Address details',form.address_details || 'Not provided'],['Date',form.date],['Time',form.time],['Trip type',form.trip_type],['Travelers',`${form.adults} ${translate('Adults')}, ${form.children} ${translate('Children')}, ${form.infants} ${translate('Infants')}`]]" :key="label"><dt>{{ $t(label) }}</dt><dd>{{ ['Trip type', 'Special requests', 'Address details'].includes(label) && ['One way', 'Return', 'Not provided', 'None'].includes(value) ? $t(value) : value }}</dd></div></dl></section>
                <section><div class="jb-review-heading"><h3>{{ $t("Contact details") }}</h3><button type="button" :aria-label='$t("Edit contact details")' @click="go(2)">{{ $t("Edit") }}</button></div><dl><div v-for="[label,value] in [['Full name',form.full_name],['Phone number',`${phoneCode} ${form.phone_number}`],['Email',form.email || 'Not provided'],['Special requests',form.notes || 'None']]" :key="label"><dt>{{ $t(label) }}</dt><dd>{{ ['Trip type', 'Special requests', 'Address details'].includes(label) && ['One way', 'Return', 'Not provided', 'None'].includes(value) ? $t(value) : value }}</dd></div></dl></section>
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
