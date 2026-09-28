import React, { useState, useMemo } from "react";
import { COLORS, cardStyle } from "./tokens";

function statusMeta(status) {
  switch (status) {
    case "fulfilled":
      return { label: "Fulfilled", fg: COLORS.teal, bg: COLORS.tealSoft };
    case "processing":
      return { label: "Processing", fg: COLORS.amber, bg: COLORS.amberSoft };
    case "cancelled":
      return { label: "Cancelled", fg: COLORS.rose, bg: COLORS.roseSoft };
    default:
      return { label: status, fg: COLORS.inkSoft, bg: "#EFEFEF" };
  }
}

export default function OrdersView({ orders }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => orders.filter((o) => filter === "all" || o.status === filter),
    [orders, filter]
  );

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, margin: 0 }}>
          Orders
        </h1>
        <p style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 4 }}>{orders.length} total orders</p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["all", "processing", "fulfilled", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              border: `1px solid ${filter === f ? COLORS.ink : COLORS.border}`,
              background: filter === f ? COLORS.ink : "#fff",
              color: filter === f ? "#fff" : COLORS.inkSoft,
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr 2fr 0.8fr 1fr 1fr",
            padding: "10px 18px",
            fontSize: 11.5,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            color: COLORS.inkSoft,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <div>Order</div>
          <div>Customer</div>
          <div>Items</div>
          <div>Total</div>
          <div>Status</div>
          <div>Placed</div>
        </div>
        {filtered.map((o) => {
          const meta = statusMeta(o.status);
          return (
            <div
              key={o.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr 2fr 0.8fr 1fr 1fr",
                padding: "12px 18px",
                borderBottom: `1px solid ${COLORS.border}`,
                alignItems: "center",
              }}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{o.id}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{o.customer}</div>
              <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>
                {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>${o.total}</div>
              <div>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: meta.fg, background: meta.bg, borderRadius: 6, padding: "3px 8px" }}>
                  {meta.label}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.inkSoft }}>
                {new Date(o.placedAt).toLocaleDateString()}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: COLORS.inkSoft, fontSize: 13.5 }}>
            No orders match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
