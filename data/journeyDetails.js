import { luxorJourney } from './luxorJourney.js'
import { journeys } from './journeys.js'
export { luxorJourney } from './luxorJourney.js'
// Catalog detail records expose only supplied demo content. Do not invent
// itineraries, inclusions, guide languages, or reviews for an unpopulated record.
export const journeyDetails = Object.fromEntries(journeys.map(journey => [journey.slug,
  journey.slug === luxorJourney.slug ? luxorJourney : {
    slug: journey.slug, title: journey.title, location: journey.destination,
    duration: journey.duration, price: journey.price, currency: 'USD', countryCode: 'EG',
    group: 'Private for you and your companions', overview: journey.description,
    image: { type: 'image', src: journey.image, alt: journey.alt, position: journey.imagePosition || 'center' },
    tags: journey.tags || [], catalogOnly: true,
  },
]))
