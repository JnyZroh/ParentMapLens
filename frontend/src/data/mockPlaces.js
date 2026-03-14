/**
 * mockPlaces.js
 *
 * Shared venue data used by both SearchResultPage and HomeDashboard.
 * All venues are in the Verdun borough of Montréal on or near Rue Wellington.
 *
 * When Phase 5 introduces a real backend, replace this export with a fetch
 * to GET /api/places and remove this file.
 */

export const MOCK_PLACES = [
  {
    id: 1,
    confirmed: true,   // a user has reviewed and verified the tags for this venue
    name: 'Café La Marmite',
    address: '3975 Rue Wellington, Verdun, H4G 1V4',
    rating: 4.3,
    distance: 0.3,
    tags: ['stroller_friendly', 'changing_table', 'play_area', 'high_chairs', 'unisex_baby_duty'],
    coordinates: [45.4659, -73.5720],
    photos: [
      { src: 'https://picsum.photos/seed/verdun-cafe-interior/400/300',  label: 'Venue'           },
      { src: 'https://picsum.photos/seed/restaurant-highchair/400/300',  label: 'High Chairs'     },
      { src: 'https://picsum.photos/seed/wide-cafe-entrance/400/300',    label: 'Stroller Access' },
      { src: 'https://picsum.photos/seed/baby-change-station/400/300',   label: 'Changing Table'  },
      { src: 'https://picsum.photos/seed/toddler-play-corner/400/300',   label: 'Play Area'       },
      { src: 'https://picsum.photos/seed/family-restroom-sign/400/300',  label: 'Family Restroom' },
    ],
  },
  {
    id: 2,
    confirmed: false,  // tags reported but not yet user-verified
    name: 'La Cantine Verdunoise',
    address: '4102 Rue Wellington, Verdun, H4G 1V7',
    rating: 4.0,
    distance: 0.6,
    tags: ['stroller_friendly', 'changing_table', 'play_area', 'high_chairs'],
    coordinates: [45.4655, -73.5756],
    photos: [
      { src: 'https://picsum.photos/seed/cantine-verdun-interior/400/300', label: 'Venue'           },
      { src: 'https://picsum.photos/seed/cantine-highchair/400/300',       label: 'High Chairs'     },
      { src: 'https://picsum.photos/seed/cantine-wide-entrance/400/300',   label: 'Stroller Access' },
      { src: 'https://picsum.photos/seed/cantine-baby-change/400/300',     label: 'Changing Table'  },
      { src: 'https://picsum.photos/seed/cantine-play-corner/400/300',     label: 'Play Area'       },
      { src: 'https://picsum.photos/seed/cantine-menu-board/400/300',      label: 'Menu'            },
    ],
  },
  {
    id: 3,
    confirmed: true,   // a user has reviewed and verified the tags for this venue
    name: 'Boulangerie Automne',
    address: '3889 Rue Wellington, Verdun, H4G 1T9',
    rating: 4.5,
    distance: 0.4,
    tags: ['changing_table', 'high_chairs'],
    coordinates: [45.4663, -73.5697],
    photos: [
      { src: 'https://picsum.photos/seed/boulangerie-automne-shop/400/300', label: 'Venue'          },
      { src: 'https://picsum.photos/seed/boulangerie-highchair/400/300',    label: 'High Chairs'    },
      { src: 'https://picsum.photos/seed/boulangerie-change/400/300',       label: 'Changing Table' },
      { src: 'https://picsum.photos/seed/boulangerie-pastries/400/300',     label: 'Pastries'       },
      { src: 'https://picsum.photos/seed/boulangerie-counter/400/300',      label: 'Counter'        },
      { src: 'https://picsum.photos/seed/boulangerie-seating/400/300',      label: 'Seating'        },
    ],
  },
  {
    id: 4,
    confirmed: false,  // tags reported but not yet user-verified
    name: 'Parc-Café Riverside',
    address: '600 Prom. Wellington, Verdun, H4G 1M4',
    rating: 4.2,
    distance: 0.8,
    tags: ['stroller_friendly', 'play_area', 'high_chairs', 'unisex_baby_duty'],
    coordinates: [45.4672, -73.5770],
    photos: [
      { src: 'https://picsum.photos/seed/parc-cafe-terrace/400/300',    label: 'Venue'           },
      { src: 'https://picsum.photos/seed/parc-cafe-highchair/400/300',  label: 'High Chairs'     },
      { src: 'https://picsum.photos/seed/parc-stroller-path/400/300',   label: 'Stroller Access' },
      { src: 'https://picsum.photos/seed/parc-play-area/400/300',       label: 'Play Area'       },
      { src: 'https://picsum.photos/seed/parc-family-restroom/400/300', label: 'Family Restroom' },
      { src: 'https://picsum.photos/seed/parc-riverside-view/400/300',  label: 'Riverside'       },
    ],
  },
  {
    id: 5,
    confirmed: false,  // tags reported but not yet user-verified
    name: 'Brasserie du Quartier',
    address: '75 Rue Galt O., Verdun, H4G 1B8',
    rating: 3.8,
    distance: 1.2,
    tags: ['stroller_friendly', 'changing_table', 'high_chairs'],
    coordinates: [45.4645, -73.5668],
    photos: [
      { src: 'https://picsum.photos/seed/brasserie-quartier-interior/400/300', label: 'Venue'           },
      { src: 'https://picsum.photos/seed/brasserie-highchair/400/300',         label: 'High Chairs'     },
      { src: 'https://picsum.photos/seed/brasserie-stroller-space/400/300',    label: 'Stroller Access' },
      { src: 'https://picsum.photos/seed/brasserie-change-room/400/300',       label: 'Changing Table'  },
      { src: 'https://picsum.photos/seed/brasserie-bar-area/400/300',          label: 'Bar Area'        },
      { src: 'https://picsum.photos/seed/brasserie-food-plate/400/300',        label: 'Food'            },
    ],
  },
]
