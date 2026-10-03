<script setup>
defineProps({ name: { type: String, required: true }, size: { type: Number, default: 16 } })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'pin'">
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </template>
    <template v-else-if="name === 'arrow'">
      <path d="M5 12h13M14 7l5 5-5 5" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m7 9 5 5 5-5" />
    </template>
    <template v-else-if="name === 'chevron-left'">
      <path d="m15 18-6-6 6-6" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <path d="m9 18 6-6-6-6" />
    </template>
    <template v-else-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="m6 6 12 12M18 6 6 18" />
    </template>
    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.41M17.66 6.34l1.41-1.41" />
    </template>
    <template v-else-if="name === 'moon'">
      <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
    </template>
    <template v-else-if="name === 'shield'">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </template>
    <template v-else-if="name === 'lock'">
      <rect x="5" y="10" width="14" height="11" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </template>
    <template v-else-if="name === 'people-pin'">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-4 2.3-6 5.5-6 2.2 0 3.7.9 4.6 2.7" />
      <path d="M20 15.5c0 2.7-4 6.5-4 6.5s-4-3.8-4-6.5a4 4 0 1 1 8 0Z" />
    </template>
    <template v-else-if="name === 'ear'">
      <path d="M6.5 12.5V9a5.5 5.5 0 0 1 11 0c0 3.5-2.6 4-3.7 6.8-.8 2-1.8 3.2-3.8 3.2-1.7 0-3-1.1-3-2.7" />
      <path d="M10 11a2.5 2.5 0 0 1 5 0c0 2.2-2.8 2.5-3 5" />
    </template>
    <template v-else-if="name === 'map'">
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
      <path d="M9 3v15M15 6v15" />
    </template>
    <template v-else-if="name === 'person'">
      <circle cx="12" cy="7" r="3" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2M3 21h18" />
    </template>
    <template v-else-if="name === 'sunrise'">
      <path d="M3 18h18M5 15a7 7 0 0 1 14 0M12 3v4M4.2 7.2l2.3 2.3M19.8 7.2l-2.3 2.3" />
    </template>
    <template v-else-if="name === 'leaf'">
      <path d="M20 3C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-8 10-17Z" />
      <path d="M4 21c3-6 7-10 12-13" />
    </template>
    <template v-else-if="name === 'community'">
      <circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" />
      <path d="M2 21v-2a6 6 0 0 1 12 0v2M14 15.5a5 5 0 0 1 8 4V21" />
    </template>
    <template v-else-if="name === 'protect'">
      <path d="M12 3c2 3 3 5 3 7a3 3 0 0 1-6 0c0-2 1-4 3-7Z" />
      <path d="M8 21v-5M16 21v-5M8 18c-3 0-5-2-5-5M16 18c3 0 5-2 5-5M12 21V11" />
    </template>
    <template v-else-if="name === 'heart'">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </template>
    <template v-else-if="name === 'help-circle'">
      <circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.4 2.4 0 1 1 3.5 2.2c-.9.5-1.3 1-1.3 2.1M12 17h.01" />
    </template>
    <template v-else-if="name === 'calendar'">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01" />
    </template>
    <template v-else-if="name === 'card'">
      <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h3" />
    </template>
    <template v-else-if="name === 'car'">
      <path d="M4 16V9l2-4h12l2 4v7M3 12h18M6 16v3M18 16v3M7 13h.01M17 13h.01" /><path d="M7 9l1-2h8l1 2" />
    </template>
    <template v-else-if="name === 'suitcase'">
      <rect x="3" y="7" width="18" height="14" rx="2" /><path d="M9 7V4h6v3M8 7v14M16 7v14" />
    </template>
    <template v-else-if="name === 'camera'">
      <path d="M4 7h4l2-3h4l2 3h4a2 2 0 0 1 2 2v10H2V9a2 2 0 0 1 2-2Z" /><circle cx="12" cy="13" r="4" />
    </template>
    <template v-else-if="name === 'refresh'">
      <path d="M20 11a8 8 0 1 0-2.3 6M20 4v7h-7" />
    </template>
    <template v-else-if="name === 'dots'">
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="9" />
    </template>
    <template v-else-if="name === 'globe'">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z" />
    </template>
    <template v-else-if="name === 'whatsapp'">
      <path d="M20.4 11.8a8.4 8.4 0 0 1-12.5 7.3L3 20.5l1.4-4.7A8.4 8.4 0 1 1 20.4 11.8Z" /><path d="M8.5 7.7c.2-.5.4-.5.8-.5h.4c.2 0 .4.1.5.4l.9 2c.1.3.1.5-.1.7l-.7.9c-.2.2-.1.4 0 .6.8 1.4 1.9 2.4 3.4 3 .2.1.4.1.6-.1l.9-1.1c.2-.2.4-.3.7-.2l2.1 1c.3.1.4.3.4.5 0 .3-.1 1.5-1 2.1-.8.6-1.8.8-3 .4-1.5-.5-3.1-1.3-4.8-2.8-1.3-1.2-2.4-2.7-3-4.2-.5-1.3 0-2.2.3-2.7Z" />
    </template>
    <template v-else-if="name === 'instagram'">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'facebook'">
      <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2.1-2H18V1.4c-.5-.1-1.5-.2-2.7-.2C12 1.2 10 3.2 10 6.8V9H7v4h3v8" />
    </template>
    <template v-else-if="name === 'mail'">
      <rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" />
    </template>
    <template v-else-if="name === 'send'">
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </template>
    <template v-else-if="name === 'headset'">
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" /><path d="M4 14h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2ZM20 14h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM17 20c-1 2-3 2-5 2" />
    </template>
    <template v-else-if="name === 'compass'">
      <circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5Z" />
    </template>
    <template v-else-if="name === 'ticket'">
      <path d="M3 7a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4Z" /><path d="M9 7v2M9 12v2M9 17v.1M15 9l3 3-3 3" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" />
    </template>
    <template v-else-if="name === 'booking-calendar'">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18m-5 4-4 4-2-2" />
    </template>
    <template v-else-if="name === 'chat'">
      <path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 10 10 0 0 1-3.7-.8L3 21l1.7-4.8A8.6 8.6 0 1 1 21 11.5Z" />
      <circle cx="8" cy="11" r=".8" fill="currentColor" stroke="none" /><circle cx="12" cy="11" r=".8" fill="currentColor" stroke="none" /><circle cx="16" cy="11" r=".8" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'checklist'">
      <path d="M9 5V3h6v2h3a2 2 0 0 1 2 2v14H4V7a2 2 0 0 1 2-2h3Z" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="m8 11 2 2 4-4m-6 9 2 2 5-5" />
    </template>
    <template v-else-if="name === 'hand-payment'">
      <path d="M3 14h3v7H3zM6 15h3l3 2h4c2 0 2 3 0 3h-5" /><path d="m6 20 6 2 8-4c2-1 1-4-1-3l-4 2M15 3c-3 0-5 2-5 4 0 4 5 6 5 6s5-2 5-6c0-2-2-4-5-4Z" /><path d="M15 5v6m2-5.2c-.7-.6-3-.6-3 .7 0 1.7 3 1 3 2.7 0 1.3-2.3 1.3-3 .7" />
    </template>
    <template v-else-if="name === 'grid'">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </template>
    <template v-else-if="name === 'list'">
      <path d="M9 6h12M9 12h12M9 18h12" /><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'landmark'">
      <path d="m3 9 9-5 9 5M5 10h14M6 10v7M10 10v7M14 10v7M18 10v7M4 20h16" />
    </template>
    <template v-else-if="name === 'sailboat'">
      <path d="M12 3v12M12 4 5 14h7M13 6l6 8h-6M3 18c2 2 4 2 6 0 2 2 4 2 6 0 2 2 4 2 6 0" />
    </template>
    <template v-else-if="name === 'mountain'">
      <path d="m3 19 7-12 4 6 2-3 5 9Z" /><path d="m8 10 2 2 2-2" />
    </template>
    <template v-else-if="name === 'snorkel'">
      <path d="M3 10h7v4H7a4 4 0 0 1-4-4ZM14 10h7a4 4 0 0 1-4 4h-3v-4ZM10 12h4M18 14v4a3 3 0 0 0 3 3" />
    </template>
    <template v-else-if="name === 'relax'">
      <path d="M4 14h16M6 14l-2 6M18 14l2 6M7 14l3-7 6 7M9 9l-3-3M15 9l3-3" />
    </template>
    <template v-else-if="name === 'star'">
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z" fill="currentColor" stroke="none" />
    </template>
  </svg>
</template>
