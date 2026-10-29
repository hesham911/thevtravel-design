<script setup>
// A CMS card's icon.
//
// The icon is artwork an admin uploads (Website Content → the page → the
// section → a card's "Icon image"), and nothing else: the icon-name select
// that used to sit beside it is gone, so this component never draws one of
// the icons the site ships. Every seeded card carries the file its old icon
// name stood for, so nothing lost its mark in the change. Two things follow,
// and this component is where both live so no page has to repeat them:
//
//   * Light and dark mode are separate files, switched in CSS exactly the way
//     the site's two logos are — so the right one is already correct in the
//     server-rendered HTML and there is no flash on hydration. A card with
//     only the light file uses it in both themes: a mark drawn in a
//     theme-neutral colour needs one file, not two.
//   * The size is the one the design asks for. An uploaded icon is boxed
//     into exactly the square the icon it replaces occupied, so a tall or
//     wide upload cannot push a card's layout around — and a card with no
//     artwork at all holds that same square empty rather than collapsing,
//     which would reflow everything beside it.
//
// The uploaded image is decorative: the card's own title says what it is, so
// an empty alt keeps a screen reader from reading an icon's filename out.

const props = defineProps({
  // The admin's uploads, as the CMS serves them.
  imageUrl: { type: String, default: '' },
  imageDarkUrl: { type: String, default: '' },
  size: { type: Number, default: 24 },
})

const box = { width: `${props.size}px`, height: `${props.size}px` }
</script>

<template>
  <span class="content-icon" :style="box">
    <template v-if="imageUrl">
      <img class="content-icon-light" :src="imageUrl" alt="" :width="size" :height="size" loading="lazy" decoding="async" />
      <img v-if="imageDarkUrl" class="content-icon-dark" :src="imageDarkUrl" alt="" :width="size" :height="size" loading="lazy" decoding="async" />
    </template>
  </span>
</template>

<style scoped>
/* The box the icon sits in is the component's own. The light/dark swap is
   NOT here: a scoped `:global(:root[data-theme='dark'])` selector is dropped
   by the SFC compiler, so those rules live in assets/css/styles.css beside
   the identical swap the site's two logos use. */
.content-icon { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
.content-icon img { width: 100%; height: 100%; object-fit: contain; }
</style>
