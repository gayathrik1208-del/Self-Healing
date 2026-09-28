import React, { useState } from "react";
import { Package, ClipboardList, ShieldCheck, LogOut } from "lucide-react";
import { COLORS } from "./tokens";
import { ADMIN, INITIAL_PRODUCTS, ORDERS, RECOVERY_LOGS } from "./mockData";
import AdminLogin from "./AdminLogin";
import ProductManager from "./ProductManager";
import OrdersView from "./OrdersView";
import RecoveryLogs from "./RecoveryLogs";

const NAV = [
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "recovery", label: "Recovery logs", icon: ShieldCheck },
];

let nextIdCounter = INITIAL_PRODUCTS.length + 1;

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState("products");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  function handleAdd(payload) {
    const id = `P-${String(nextIdCounter++).padStart(2, "0")}`;
    setProducts((p) => [...p, { id, ...payload }]);
  }

  function handleUpdate(id, payload) {
    setProducts((p) => p.map((prod) => (prod.id === id ? { ...prod, ...payload } : prod)));
  }

  function handleDelete(id) {
    setProducts((p) => p.filter((prod) => prod.id !== id));
  }

  if (!loggedIn) {
    return <AdminLogin admin={ADMIN} onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex" }}>
      <aside
        style={{
          width: 208,
          flexShrink: 0,
          borderRight: `1px solid ${COLORS.border}`,
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, marginBottom: 28, paddingLeft: 8 }}>
          Ledger Admin
        </div>
        {NAV.map(({ key, label, icon: Icon }) => {
          const isActive = activeNav === key;
          return (
            <button
              key={key}
              onClick={() => setActiveNav(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 8,
                border: "none",
                background: isActive ? COLORS.tealSoft : "transparent",
                color: isActive ? COLORS.teal : COLORS.inkSoft,
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 500,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </button>
          );
        })}

        <div style={{ marginTop: "auto" }}>
          <button
            onClick={() => setLoggedIn(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: COLORS.inkSoft,
              fontSize: 13.5,
              fontWeight: 500,
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
            }}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "28px 36px", maxWidth: 1040 }}>
        {activeNav === "products" && (
          <ProductManager products={products} onAdd={handleAdd} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
        {activeNav === "orders" && <OrdersView orders={ORDERS} />}
        {activeNav === "recovery" && <RecoveryLogs logs={RECOVERY_LOGS} />}
      </main>
    </div>
  );
}
