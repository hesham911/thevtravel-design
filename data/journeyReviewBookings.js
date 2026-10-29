// Demo Journey Bookings behind a customer review link, keyed by the token the
// QR code or WhatsApp message carries. Each record holds only what a customer
// may see about their own booking: the journey it was for, when they travelled
// and the photos an admin has attached to it. Prices, payments, driver and
// guide details are deliberately absent — the review page never shows them.
//
// `photos` is what the admin uploaded for this booking, so it is empty until
// they do. `review` is present once a review has been submitted for the
// booking. Replace this module with the API's own response when the review
// endpoint exists; the page reads nothing else.
const photo = (id, file, alt) => ({ id, src: `/assets/photos/${file}.png`, alt })

const luxorAtDawn = {
  title: 'Luxor, west bank at dawn',
  date: '2026-10-12',
  location: 'Luxor, Egypt',
  image: { src: '/assets/photos/hero-colossi-wide.png', alt: 'The Colossi of Memnon in the warm morning light' },
  summary: 'A quiet morning across the Nile, among tombs and temples in the first light of the day.',
}

const feluccaSunset = {
  title: 'The Nile at golden hour',
  date: '2026-10-03',
  location: 'Aswan, Egypt',
  image: { src: '/assets/photos/journey-felucca.png', alt: 'A traditional felucca sailing on the Nile at sunset' },
  summary: 'An unhurried sail on the Nile as the light turned and the river went quiet.',
}

export const journeyReviewBookings = Object.freeze({
  // A journey whose photos are ready, waiting for the customer's review.
  'demo-luxor-dawn': {
    journey: luxorAtDawn,
    photos: [
      photo('bp-1', 'hero-colossi-wide', 'The Colossi of Memnon in the warm morning light'),
      photo('bp-2', 'journey-karnak', 'Sunlight between the columns of Karnak Temple'),
      photo('bp-3', 'gallery-tomb-art', 'Detailed artwork in an ancient Egyptian tomb'),
      photo('bp-4', 'gallery-avenue', 'An avenue of ancient Egyptian monuments'),
      photo('bp-5', 'journey-felucca', 'A traditional felucca sailing on the Nile at sunset'),
      photo('bp-6', 'journey-sinai', 'Golden light over the desert mountains'),
    ],
    review: null,
  },

  // The ordinary case right after a journey: the review link works, the
  // photos have not been uploaded yet.
  'demo-no-photos': {
    journey: feluccaSunset,
    photos: [],
    review: null,
  },

  // A booking whose customer has already shared their experience.
  'demo-reviewed': {
    journey: luxorAtDawn,
    photos: [
      photo('bp-1', 'hero-colossi-wide', 'The Colossi of Memnon in the warm morning light'),
      photo('bp-2', 'journey-karnak', 'Sunlight between the columns of Karnak Temple'),
      photo('bp-3', 'gallery-tomb-art', 'Detailed artwork in an ancient Egyptian tomb'),
    ],
    review: {
      rating: 5,
      comment: 'We left the hotel before sunrise and had the west bank almost to ourselves. Our guide gave us the history without hurrying us through it, and the light over the valley on the way back is something we keep talking about.',
      submittedAt: '2026-10-13',
      photoIds: ['bp-2', 'bp-3'],
    },
  },
})
