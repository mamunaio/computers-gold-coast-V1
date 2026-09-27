// Single source of truth for the Gold Coast business NAP + service areas.
// Used for schema and future pages so the phone/address live in one place.
export const business = {
  name: 'Computers Gold Coast',
  phone: '0447 266 455',
  phoneHref: 'tel:+61447266455',
  url: 'https://computersgoldcoast.com.au/',
  areasServed: [
    'Surfers Paradise', 'Broadbeach', 'Southport', 'Robina',
    'Burleigh Heads', 'Nerang', 'Varsity Lakes', 'Coolangatta',
  ],
  hours: 'Mon-Sun 7:00 AM - 10:00 PM',
} as const;
