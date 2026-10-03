<script setup>
import { ArrowRight, GlassWater, CalendarCheck, CalendarDays, Camera, Car, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock, Compass, Contact, CreditCard, Crown, Ear, Ellipsis, Footprints, Globe, Headset, Heart, House, Image, Landmark, LayoutGrid, LocateFixed, Leaf, List, ListChecks, Lock, Luggage, Mail, Map, MapPin, Menu, MessageCircle, Minus, Moon, Mountain, Play, Plus, RotateCcw, Sailboat, Search, Send, Share2, ShieldCheck, Shirt, Sprout, Star, Sun, Sunrise, Ticket, UserRound, UsersRound, Waves, X } from '@lucide/vue'
defineProps({ name: { type: String, required: true }, size: { type: Number, default: 16 } })
const icons = {
  locate: LocateFixed,
  'pin': MapPin,
  'clock': Clock,
  'arrow': ArrowRight,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'menu': Menu,
  'close': X,
  'sun': Sun,
  'moon': Moon,
  'shield': ShieldCheck,
  'lock': Lock,
  'people-pin': Contact,
  'ear': Ear,
  'map': Map,
  'person': UserRound,
  'sunrise': Sunrise,
  'leaf': Leaf,
  'community': UsersRound,
  'people': UsersRound,
  'protect': Sprout,
  'heart': Heart,
  'help-circle': CircleHelp,
  'calendar': CalendarDays,
  'card': CreditCard,
  'car': Car,
  'suitcase': Luggage,
  'camera': Camera,
  'refresh': RotateCcw,
  'dots': Ellipsis,
  'globe': Globe,
  'mail': Mail,
  'send': Send,
  'headset': Headset,
  'compass': Compass,
  'ticket': Ticket,
  'search': Search,
  'booking-calendar': CalendarCheck,
  'chat': MessageCircle,
  'checklist': ListChecks,
  'grid': LayoutGrid, LocateFixed,
  'list': List,
  'landmark': Landmark,
  'sailboat': Sailboat,
  'mountain': Mountain,
  'snorkel': Waves,
  'relax': Sun,
  'star': Star,
  'check': Check,
  'play': Play,
  'home': House,
  'image': Image,
  'outline-star': Star,
  'more': Ellipsis,
  'crown': Crown,
  'bottle': GlassWater,
  'walk': Footprints,
  'hat': Shirt,
  'share': Share2,
  'plus': Plus,
  'minus': Minus,
}
</script>
<template>
  <component v-if="icons[name]" :is="icons[name]" :size="size" :stroke-width="1.8" aria-hidden="true" />
  <svg v-else :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'whatsapp'">
      <path d="M20.4 11.8a8.4 8.4 0 0 1-12.5 7.3L3 20.5l1.4-4.7A8.4 8.4 0 1 1 20.4 11.8Z" /><path d="M8.5 7.7c.2-.5.4-.5.8-.5h.4c.2 0 .4.1.5.4l.9 2c.1.3.1.5-.1.7l-.7.9c-.2.2-.1.4 0 .6.8 1.4 1.9 2.4 3.4 3 .2.1.4.1.6-.1l.9-1.1c.2-.2.4-.3.7-.2l2.1 1c.3.1.4.3.4.5 0 .3-.1 1.5-1 2.1-.8.6-1.8.8-3 .4-1.5-.5-3.1-1.3-4.8-2.8-1.3-1.2-2.4-2.7-3-4.2-.5-1.3 0-2.2.3-2.7Z" />
    </template>
    <template v-else-if="name === 'instagram'">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'facebook'">
      <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2.1-2H18V1.4c-.5-.1-1.5-.2-2.7-.2C12 1.2 10 3.2 10 6.8V9H7v4h3v8" />
    </template>
  </svg>
</template>
