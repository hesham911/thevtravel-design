<template>
  <section id="request" class="journey-cta" aria-labelledby="request-title">
    <div class="journey-cta-copy">
      <h2 id="request-title">{{ $t("Ready to plan your") }}<br />{{ $t("Egypt journey?") }}</h2>
      <p>{{ $t("Send your request and we’ll take care of the rest.") }}</p>
      <a class="button button-primary" href="#request">{{ $t("Send your request") }}</a>
    </div>
    <div class="journey-cta-media">
      <img src="/assets/sections/cta-felucca-mosque.png" :alt='$t("A felucca sailing past a mosque at sunset")' width="505" height="158" loading="lazy" />
    </div>
  </section>
</template>
