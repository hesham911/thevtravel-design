import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomePage from './views/HomePage.vue'
import AboutPage from './views/AboutPage.vue'
import FAQPage from './views/FAQPage.vue'
import ContactPage from './views/ContactPage.vue'
import HowBookingWorksPage from './views/HowBookingWorksPage.vue'
import JourneysPage from './views/JourneysPage.vue'
import JourneyDetailsPage from './views/JourneyDetailsPage.vue'
import { journeyDetails } from './data/journeyDetails'
import { initializeTheme } from './theme'
import './styles.css'

initializeTheme()

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage, meta: { title: 'TheVTravel — Journeys across Egypt' } },
    { path: '/about', name: 'about', component: AboutPage, meta: { title: 'About TheVTravel — Egypt, planned with local care' } },
    { path: '/faq', name: 'faq', component: FAQPage, meta: { title: 'Frequently Asked Questions — TheVTravel' } },
    { path: '/contact', name: 'contact', component: ContactPage, meta: { title: 'Contact Us — TheVTravel' } },
    { path: '/how-booking-works', name: 'how-booking-works', component: HowBookingWorksPage, meta: { title: 'How Booking Works — TheVTravel' } },
    { path: '/journeys/:slug', name: 'journey-details', component: JourneyDetailsPage, meta: { title: 'Journey Details — TheVTravel' } },
    { path: '/journeys', name: 'journeys', component: JourneysPage, meta: { title: 'All Journeys — TheVTravel' } },
  ],
})

router.afterEach((to) => {
  document.title = to.name === 'journey-details' && journeyDetails[to.params.slug] ? `${journeyDetails[to.params.slug].title} — TheVTravel` : to.meta.title
})

createApp(App).use(router).mount('#app')
