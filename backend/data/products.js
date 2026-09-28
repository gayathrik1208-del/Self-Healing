// In-memory product catalog. Replace with a real database table/collection
// when you're ready (Postgres, MongoDB, etc.) — the route layer doesn't need
// to change, just how this data is fetched.
let products = [
  { id: "P-01", name: "Fieldnote linen jacket", category: "Apparel", price: 128, stock: 14 },
  { id: "P-02", name: "Ceramic pour-over set", category: "Home", price: 42, stock: 30 },
  { id: "P-03", name: "Waxed canvas tote", category: "Accessories", price: 68, stock: 22 },
  { id: "P-04", name: "Cedar desk organizer", category: "Home", price: 36, stock: 9 },
  { id: "P-05", name: "Merino travel scarf", category: "Apparel", price: 54, stock: 17 },
  { id: "P-06", name: "Brass reading lamp", category: "Home", price: 96, stock: 6 },
  { id: "P-07", name: "Recycled wool socks (3-pack)", category: "Apparel", price: 24, stock: 40 },
  { id: "P-08", name: "Leather cardholder", category: "Accessories", price: 32, stock: 25 },
];

module.exports = { products };
