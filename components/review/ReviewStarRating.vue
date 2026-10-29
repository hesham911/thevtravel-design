<script setup>
import { computed, ref } from 'vue'
import AppIcon from '~/components/AppIcon.vue'
import { useI18n } from '~/utils/i18n'

// Five native radios in a fieldset: a browser already gives them arrow-key
// movement, a single tab stop and a group name a screen reader reads out, so
// the stars are only what the radios look like. Each star keeps a 44px touch
// target on a phone.
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  name: { type: String, default: 'journey-rating' },
  invalid: Boolean,
  describedBy: String,
})
const emit = defineEmits(['update:modelValue'])
const { translate } = useI18n()

const words = ['Not what we hoped', 'It was okay', 'A good journey', 'We really enjoyed it', 'Unforgettable']
const hovered = ref(0)
const shown = computed(() => hovered.value || props.modelValue)

function starLabel(value) {
  return translate(value === 1 ? '1 star — {word}' : '{count} stars — {word}', { count: value, word: translate(words[value - 1]) })
}
</script>

<template>
  <fieldset class="jr-rating" :class="{ 'has-error': invalid }">
    <legend>{{ $t("How would you rate this journey?") }}</legend>
    <div class="jr-rating-row">
      <div class="jr-stars" @mouseleave="hovered = 0">
        <label v-for="n in 5" :key="n" class="jr-star" :class="{ filled: n <= shown }" @mouseenter="hovered = n">
          <input
            type="radio"
            :name="name"
            :value="n"
            :checked="modelValue === n"
            :aria-label="starLabel(n)"
            :aria-invalid="invalid ? 'true' : undefined"
            :aria-describedby="describedBy"
            @change="emit('update:modelValue', n)"
            @focus="hovered = n"
            @blur="hovered = 0"
          />
          <AppIcon name="star" :size="38" />
        </label>
      </div>
      <p class="jr-rating-word" aria-hidden="true">{{ shown ? $t(words[shown - 1]) : $t("Tap a star to rate") }}</p>
    </div>
  </fieldset>
</template>
