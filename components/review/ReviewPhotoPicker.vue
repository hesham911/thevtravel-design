<script setup>
import { computed } from 'vue'
import AppIcon from '~/components/AppIcon.vue'

// The photos an admin attached to this Journey Booking. Choosing them is a
// checkbox each — a customer may pick none, one or several — and the magnifier
// opens the site's own photo viewer, so the picker never has to show a photo
// larger than its tile. Customers do not upload here; they choose from what
// the booking already carries.
const props = defineProps({
  photos: { type: Array, default: () => [] },
  selected: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:selected', 'enlarge'])

const chosen = computed(() => new Set(props.selected))

function toggle(id) {
  const next = new Set(chosen.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  emit('update:selected', props.photos.filter(photo => next.has(photo.id)).map(photo => photo.id))
}
</script>

<template>
  <div class="jr-photos">
    <div class="jr-photo-grid">
      <div v-for="(photo, index) in photos" :key="photo.id" class="jr-photo" :class="{ selected: chosen.has(photo.id) }">
        <label class="jr-photo-pick">
          <input
            type="checkbox"
            :checked="chosen.has(photo.id)"
            :aria-label="$t('Choose this photo: {description}', { description: $t(photo.alt) })"
            @change="toggle(photo.id)"
          />
          <img :src="photo.src" :alt="$t(photo.alt)" loading="lazy" />
          <span class="jr-photo-mark" aria-hidden="true"><AppIcon name="check" :size="17" /></span>
        </label>
        <button
          type="button"
          class="jr-photo-zoom"
          :aria-label="$t('View this photo larger: {description}', { description: $t(photo.alt) })"
          @click="emit('enlarge', index)"
        >
          <AppIcon name="search" :size="16" />
        </button>
      </div>
    </div>
    <p class="jr-photo-count" role="status">
      {{ selected.length ? $t('{count} of {total} photos chosen', { count: selected.length, total: photos.length }) : $t('No photos chosen — that’s perfectly fine.') }}
    </p>
  </div>
</template>
