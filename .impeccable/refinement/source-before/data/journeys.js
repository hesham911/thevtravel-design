const images = {
  karnak: '/assets/journeys/journey-karnak.png',
  abuSimbel: '/assets/journeys/journey-abu-simbel.png',
  felucca: '/assets/journeys/journey-felucca.png',
  pyramids: '/assets/journeys/journey-pyramids.png',
  sinai: '/assets/journeys/journey-sinai.png',
  alexandria: '/assets/journeys/journey-alexandria.png',
}

const featured = [
  ['Luxor Highlights', 'Luxor', '6–7 hours', 3200, 'Culture & History', images.karnak, 'Explore Karnak, Luxor Temple and the Valley of the Kings with an expert guide.', 'Popular'],
  ['Abu Simbel Day Tour', 'Aswan', '10–12 hours', 4500, 'Culture & History', images.abuSimbel, 'Discover the magnificent Abu Simbel temples and the wonders of Nubian history.', 'Best seller'],
  ['Felucca on the Nile', 'Luxor', '2–3 hours', 1200, 'Nile & Cruising', images.felucca, 'Sail the timeless Nile on a traditional felucca and enjoy the peaceful scenery.'],
  ['Luxor Hot Air Balloon', 'Luxor', '2–4 hours', 2800, 'Nature & Adventure', images.sinai, 'Soar above Luxor’s temples and the Nile for a breathtaking sunrise view.'],
  ['Giftun Island Snorkeling', 'Hurghada', '6–8 hours', 2500, 'Red Sea & Snorkeling', images.alexandria, 'Snorkel in crystal-clear waters and relax on the beautiful Giftun Island.'],
  ['White Desert Adventure', 'Farafra', '2 days / 1 night', 7800, 'Nature & Adventure', images.sinai, 'Experience the otherworldly White Desert and camp beneath a canopy of stars.'],
  ['Cairo City Tour', 'Cairo', '8 hours', 3000, 'Culture & History', images.pyramids, 'Visit the Pyramids, Egyptian Museum and Khan El Khalili Bazaar.'],
  ['Philae Temple & Aswan', 'Aswan', '4–6 hours', 2200, 'Culture & History', images.abuSimbel, 'Visit beautiful Philae Temple and enjoy a scenic boat ride in Aswan.'],
]

const more = [
  ['Desert Safari by Quad', 'Hurghada', '3–4 hours', 2000, 'Nature & Adventure', images.sinai],
  ['Hurghada Paradise', 'Hurghada', 'Full day', 1800, 'Relaxation', images.alexandria],
  ['Dendera Temple Tour', 'Qena', '5–6 hours', 2000, 'Culture & History', images.karnak],
  ['Siwa Oasis Escape', 'Siwa', '2 days / 1 night', 6500, 'Relaxation', images.sinai],
  ['Pyramids & Sphinx Private Tour', 'Cairo', '5–6 hours', 2600, 'Culture & History', images.pyramids],
  ['Nubian Village Visit', 'Aswan', '3–4 hours', 1600, 'Family Experiences', images.abuSimbel],
  ['Alexandria Coastal Day', 'Alexandria', '10–12 hours', 3900, 'Culture & History', images.alexandria],
  ['Karnak by Night', 'Luxor', '3 hours', 1750, 'Culture & History', images.karnak],
  ['Sunset Nile Dinner Cruise', 'Cairo', '3 hours', 1900, 'Nile & Cruising', images.felucca],
  ['Ras Mohammed Snorkeling', 'Sharm El Sheikh', 'Full day', 2750, 'Red Sea & Snorkeling', images.alexandria],
  ['Mount Sinai Sunrise Hike', 'Sinai', '10–12 hours', 2400, 'Nature & Adventure', images.sinai],
  ['Edfu & Kom Ombo Temples', 'Aswan', 'Full day', 3600, 'Culture & History', images.karnak],
  ['Family Pyramids Discovery', 'Cairo', '6 hours', 3100, 'Family Experiences', images.pyramids],
  ['Aswan Botanical Island', 'Aswan', '3 hours', 1450, 'Relaxation', images.felucca],
  ['Orange Bay Beach Day', 'Hurghada', '7 hours', 2300, 'Red Sea & Snorkeling', images.alexandria],
  ['Valley of the Kings', 'Luxor', '5 hours', 2450, 'Culture & History', images.karnak],
  ['Fayoum Lakes & Waterfalls', 'Fayoum', 'Full day', 3300, 'Nature & Adventure', images.sinai],
  ['Old Cairo Family Walk', 'Cairo', '4 hours', 1800, 'Family Experiences', images.pyramids],
  ['Aswan Sunset Felucca', 'Aswan', '2 hours', 1100, 'Nile & Cruising', images.felucca],
  ['Dahab Blue Hole Day', 'Dahab', 'Full day', 2950, 'Red Sea & Snorkeling', images.alexandria],
  ['Luxor East Bank Evening', 'Luxor', '4 hours', 2100, 'Culture & History', images.karnak],
  ['Siwa Salt Lakes Retreat', 'Siwa', 'Full day', 2800, 'Relaxation', images.sinai],
  ['Cairo Food & Market Walk', 'Cairo', '4 hours', 1950, 'Family Experiences', images.pyramids],
  ['Nile Islands Picnic', 'Aswan', '5 hours', 2150, 'Nile & Cruising', images.felucca],
  ['Red Sea Glass Boat', 'Hurghada', '3 hours', 1650, 'Family Experiences', images.alexandria],
  ['Abydos Sacred Temples', 'Luxor', 'Full day', 3500, 'Culture & History', images.karnak],
  ['Sinai Canyon Adventure', 'Sinai', '8 hours', 3200, 'Nature & Adventure', images.sinai],
  ['Mediterranean Heritage Walk', 'Alexandria', '5 hours', 2250, 'Culture & History', images.alexandria],
]

const defaultDescriptions = {
  'Culture & History': 'Explore remarkable monuments and stories with a knowledgeable private guide.',
  'Nile & Cruising': 'Slow down on the Nile and take in Egypt’s timeless river landscapes.',
  'Nature & Adventure': 'Discover a wilder side of Egypt on a privately paced outdoor experience.',
  'Red Sea & Snorkeling': 'Enjoy clear Red Sea waters, colorful reefs and an easy day by the coast.',
  Relaxation: 'Unwind in a beautiful setting with every detail planned around your pace.',
  'Family Experiences': 'Share an engaging, flexible day designed to work beautifully for families.',
}

function summarizeReviews(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { averageRating: null, reviewCount: 0 }
  }

  const ratings = reviews
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating) && rating >= 1 && rating <= 5)

  return {
    averageRating: ratings.length ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length : null,
    reviewCount: reviews.length,
  }
}

export const journeys = [...featured, ...more].map((item, index) => ({
  id: index + 1,
  title: item[0],
  destination: item[1],
  duration: item[2],
  price: item[3],
  interest: item[4],
  image: item[5],
  description: item[6] || defaultDescriptions[item[4]],
  badge: item[7],
  tags: item[9] || [item[4]],
  alt: `${item[0]} in ${item[1]}`,
  ...summarizeReviews(item[8]),
}))

export const interests = ['All', 'Culture & History', 'Nile & Cruising', 'Nature & Adventure', 'Red Sea & Snorkeling', 'Relaxation', 'Family Experiences']

export const destinations = ['All destinations', ...new Set(journeys.map((journey) => journey.destination))]

journeys.unshift({ id: 'luxor-dawn', title: 'Luxor, west bank at dawn', destination: 'Luxor', duration: '~ 4 hours', price: 3200, interest: 'Culture & History', image: '/assets/photos/hero-colossi-wide.png', description: 'Explore ancient tombs and temples in the soft morning light on a calm private journey.', tags: ['Private journey', 'Culture & History'], alt: 'The Colossi of Memnon at dawn', averageRating: 4.9, reviewCount: 128, detailsHref: '/journeys/luxor-west-bank-at-dawn' })
