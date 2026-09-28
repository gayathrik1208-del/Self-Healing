// In-memory mock data for the admin module. Swap for real API calls once
// the Node.js backend is wired up (see README).

export const ADMIN = { email: "admin@example.com", password: "admin123", name: "Admin" };

export const INITIAL_PRODUCTS = [
  { id: "P-01", name: "Fieldnote linen jacket", category: "Apparel", price: 128, stock: 14 },
  { id: "P-02", name: "Ceramic pour-over set", category: "Home", price: 42, stock: 30 },
  { id: "P-03", name: "Waxed canvas tote", category: "Accessories", price: 68, stock: 22 },
  { id: "P-04", name: "Cedar desk organizer", category: "Home", price: 36, stock: 9 },
  { id: "P-05", name: "Merino travel scarf", category: "Apparel", price: 54, stock: 17 },
  { id: "P-06", name: "Brass reading lamp", category: "Home", price: 96, stock: 6 },
  { id: "P-07", name: "Recycled wool socks (3-pack)", category: "Apparel", price: 24, stock: 40 },
  { id: "P-08", name: "Leather cardholder", category: "Accessories", price: 32, stock: 25 },
];

export const ORDERS = [
  {
    id: "ORD-1000",
    customer: "Aiko Sato",
    items: [{ name: "Merino travel scarf", qty: 1 }, { name: "Ceramic pour-over set", qty: 1 }],
    total: 96,
    status: "fulfilled",
    placedAt: "2026-09-14T10:22:00Z",
  },
  {
    id: "ORD-1001",
    customer: "Priya Nair",
    items: [{ name: "Fieldnote linen jacket", qty: 1 }],
    total: 128,
    status: "processing",
    placedAt: "2026-09-15T08:05:00Z",
  },
  {
    id: "ORD-1002",
    customer: "Marcus Ade",
    items: [{ name: "Recycled wool socks (3-pack)", qty: 2 }, { name: "Leather cardholder", qty: 1 }],
    total: 80,
    status: "fulfilled",
    placedAt: "2026-09-15T14:47:00Z",
  },
  {
    id: "ORD-1003",
    customer: "Ines Wouters",
    items: [{ name: "Brass reading lamp", qty: 1 }],
    total: 96,
    status: "cancelled",
    placedAt: "2026-09-16T02:10:00Z",
  },
];

// Represents entries the Python health-checker would write when it detects
// and auto-remediates a service issue. In production these come from the
// health-checker via the backend's /api/recovery-logs endpoint.
export const RECOVERY_LOGS = [
  {
    id: "RL-501",
    service: "Product Service",
    issue: "High memory usage (92%)",
    action: "Container restarted",
    status: "recovered",
    timestamp: "2026-09-16T03:12:00Z",
    durationSec: 8,
  },
  {
    id: "RL-502",
    service: "Order Service",
    issue: "Health check timeout",
    action: "Restarted + traffic re-routed",
    status: "recovered",
    timestamp: "2026-09-16T05:40:00Z",
    durationSec: 14,
  },
  {
    id: "RL-503",
    service: "Auth Service",
    issue: "Response latency > 2s",
    action: "Scaled replica, monitoring",
    status: "monitoring",
    timestamp: "2026-09-16T09:02:00Z",
    durationSec: 22,
  },
  {
    id: "RL-504",
    service: "Database",
    issue: "Connection pool exhausted",
    action: "Pool reset attempted",
    status: "failed",
    timestamp: "2026-09-16T11:18:00Z",
    durationSec: 31,
  },
  {
    id: "RL-505",
    service: "Notification Service",
    issue: "SMTP send failures",
    action: "Retried with backoff",
    status: "recovered",
    timestamp: "2026-09-16T12:30:00Z",
    durationSec: 6,
  },
];
