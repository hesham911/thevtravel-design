const photo = (file, alt) => ({ type: 'image', src: `/assets/photos/${file}.png`, alt })
const colossi = photo('hero-colossi-wide', 'The Colossi of Memnon in the warm morning light')
const nile = photo('journey-felucca', 'A traditional felucca sailing on the Nile at sunset')
const temple = photo('journey-karnak', 'Sunlight between the columns of Karnak Temple')
export const luxorJourney = {
  slug: 'luxor-west-bank-at-dawn', title: 'Luxor, west bank at dawn', location: 'Luxor, Egypt', duration: 'Half-day journey ~ 4 hours', group: 'Private for you and your companions', language: 'English', price: 3200, rating: 4.9, reviewCount: 128, image: colossi,
  overview: 'Begin your day as the sun rises over the desert. Cross gently to the west bank and explore ancient tombs and temples in the soft morning light, before the day grows warm. A calm, unhurried journey through stories that endure.',
  features: [
    { icon: 'sun', title: 'Iconic sites', text: 'World-famous tombs and temples' },
    { icon: 'camera', title: 'Peaceful morning', text: 'Quieter visits and cooler temperatures' },
    { icon: 'crown', title: 'Expert local guide', text: 'Licensed Egyptologist guide (English)' },
    { icon: 'community', title: 'Private experience', text: 'Just for you and your companions' },
  ],
  itinerary: [
    ['07:00', 'Morning pick-up', 'Your driver and guide meet you at your hotel or preferred location.'],
    ['07:30', 'Valley of the Kings', 'Explore the royal tombs carved into the desert hills.'],
    ['09:30', 'Temple of Hatshepsut', 'Discover the elegant terraces of one of Egypt’s most remarkable queens.'],
    ['10:45', 'Colossi of Memnon', 'Stand before the towering statues that have watched over the Nile for millennia.'],
    ['12:00', 'Return', 'Your driver will take you back to your location with time to rest or continue your day.'],
  ],
  itineraryMedia: { type: 'video', src: null, poster: nile, title: 'A morning on Luxor’s west bank' },
  included: [
    { icon: 'car', title: 'Private air-conditioned vehicle with professional driver', text: 'Travel comfortably with a dedicated driver throughout your journey.' },
    { icon: 'pin', title: 'Hotel pick-up and drop-off at your location', text: 'Your driver will meet you at your hotel or preferred location in Luxor.' },
    { icon: 'person', title: 'Licensed local Egyptologist guide (English)', text: 'Explore with a knowledgeable local expert guide (English).' },
    { icon: 'ticket', title: 'All entrance fees to listed sites', text: 'All entrance fees to the temples and sites included in the itinerary.' },
    { icon: 'bottle', title: 'Bottled water during the journey', text: 'Stay refreshed with bottled water provided throughout your trip.' },
  ],
  gallery: [colossi, nile, temple, photo('journey-sinai', 'Golden light over the desert mountains'), photo('gallery-avenue', 'Ancient Egyptian monuments'), photo('gallery-tomb-art', 'Detailed artwork in an ancient Egyptian tomb'), photo('hero-felucca-temple', 'A felucca beside an Egyptian temple'), photo('journey-abu-simbel', 'The magnificent temples of Abu Simbel')],
  travelers: [
    { name: 'Sarah M.', date: 'Nov 2024', type: 'Couples', rating: 5, photos: [nile, temple, colossi], text: 'Absolutely magical! Seeing the West Bank at dawn was a once-in-a-lifetime experience. Our guide was incredibly knowledgeable and brought the history to life. The early start was so worth it — we had the temples almost to ourselves.' },
    { name: 'James T.', date: 'Oct 2024', type: 'Family', rating: 5, photos: [temple, colossi, nile], text: 'A fantastic half-day tour for our family. The pacing was perfect, and our guide kept both adults and kids engaged. The temples are breathtaking in the morning light. Highly recommend this private tour!' },
    { name: 'Elena R.', date: 'Aug 2024', type: 'Solo', rating: 4, photos: [colossi, nile, temple], text: 'An unforgettable morning. The light, the atmosphere, the history — everything was perfect. My guide was friendly and very knowledgeable. A peaceful and inspiring experience.' },
    { name: 'David K.', date: 'Sep 2024', photos: [photo('gallery-avenue', 'Egyptian monuments'), nile, temple] },
    { name: 'Maria L.', date: 'Aug 2024', photos: [nile, temple, colossi] },
    { name: 'Ahmed S.', date: 'Jul 2024', photos: [temple, colossi, nile] },
  ],
  distribution: [112, 14, 2, 0, 0],
  goodToKnow: [
    { icon: 'pin', title: 'Pickup area', text: 'Your hotel or preferred location in Luxor.' },
    { icon: 'community', title: 'Group type', text: 'Private journey just for you and your companions.' },
    { icon: 'clock', title: 'Duration', text: 'Half-day (~ 4 hours).' },
    { icon: 'walk', title: 'Accessibility', text: 'Some sites include uneven ground and steps.' },
    { icon: 'hat', title: 'What to wear', text: 'Comfortable shoes, sun hat, water-friendly clothing.' },
    { icon: 'list', title: 'Flexible and easy', text: 'Pay at the start of your trip. Change plans? Just let us know.' },
  ],
  recommendations: [
    { title: 'Abu Simbel by private car', text: 'A full-day journey to one of Egypt’s most extraordinary temples.', image: photo('journey-abu-simbel', 'Abu Simbel Temple'), href: '/journeys' },
    { title: 'The Nile at golden hour', text: 'Sail, relax and watch the sun set over timeless landscapes.', image: nile, href: '/journeys' },
    { title: 'Karnak Temple, in depth', text: 'Explore the world’s greatest open-air museum with your private guide.', image: temple, href: '/journeys' },
    { title: 'Valley of the Kings', text: 'Explore remarkable monuments and stories with a knowledgeable private guide.', image: temple, href: '/journeys' },
    { title: 'Aswan Sunset Felucca', text: 'Slow down on the Nile and take in Egypt’s timeless river landscapes.', image: nile, href: '/journeys' },
  ],
}
export const journeyDetails = { [luxorJourney.slug]: luxorJourney }
