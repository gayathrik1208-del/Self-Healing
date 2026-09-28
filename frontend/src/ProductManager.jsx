import React, { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { COLORS, cardStyle, inputStyle, primaryButtonStyle, secondaryButtonStyle, dangerButtonStyle } from "./tokens";

const emptyForm = { id: "", name: "", category: "", price: "", stock: "" };

export default function ProductManager({ products, onAdd, onUpdate, onDelete }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  function openAddForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setFormOpen(true);
  }

  function openEditForm(product) {
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
    });
    setEditingId(product.id);
    setError("");
    setFormOpen(true);
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.category.trim() || !form.price || !form.stock) {
      setError("Fill in every field.");
      return;
    }
    if (Number(form.price) <= 0 || Number(form.stock) < 0) {
      setError("Price must be positive and stock can't be negative.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
    };

    if (editingId) {
      onUpdate(editingId, payload);
    } else {
      onAdd(payload);
    }
    setFormOpen(false);
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, margin: 0 }}>
            Products
          </h1>
          <p style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 4 }}>{products.length} products</p>
        </div>
        <button onClick={openAddForm} style={{ ...primaryButtonStyle, display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={15} /> Add product
        </button>
      </div>

      {formOpen && (
        <div style={{ ...cardStyle, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              {editingId ? `Edit ${editingId}` : "New product"}
            </div>
            <button
              onClick={() => setFormOpen(false)}
              style={{ border: "none", background: "none", cursor: "pointer", color: COLORS.inkSoft }}
            >
              <X size={17} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <input style={inputStyle} value={form.category} onChange={(e) => handleChange("category", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Price ($)</label>
              <input style={inputStyle} type="number" value={form.price} onChange={(e) => handleChange("price", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Stock</label>
              <input style={inputStyle} type="number" value={form.stock} onChange={(e) => handleChange("stock", e.target.value)} />
            </div>
            <button type="submit" style={primaryButtonStyle}>
              {editingId ? "Save" : "Create"}
            </button>
          </form>
          {error && <div style={{ fontSize: 13, color: COLORS.rose, marginTop: 10 }}>{error}</div>}
        </div>
      )}

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ ...rowGrid, padding: "10px 18px", fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.4, color: COLORS.inkSoft, borderBottom: `1px solid ${COLORS.border}` }}>
          <div>Name</div>
          <div>Category</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Actions</div>
        </div>
        {products.map((p) => (
          <div key={p.id} style={{ ...rowGrid, padding: "12px 18px", borderBottom: `1px solid ${COLORS.border}`, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: COLORS.inkSoft, fontFamily: "'JetBrains Mono', monospace" }}>{p.id}</div>
            </div>
            <div style={{ fontSize: 13 }}>{p.category}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>${p.price}</div>
            <div style={{ fontSize: 13 }}>{p.stock}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openEditForm(p)} style={iconBtn} aria-label="Edit">
                <Pencil size={14} />
              </button>
              <button onClick={() => setConfirmDeleteId(p.id)} style={{ ...iconBtn, color: COLORS.rose }} aria-label="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: COLORS.inkSoft, fontSize: 13.5 }}>
            No products yet. Add your first one above.
          </div>
        )}
      </div>

      {confirmDeleteId && (
        <div style={overlayStyle}>
          <div style={{ ...cardStyle, maxWidth: 340 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Delete {confirmDeleteId}?</div>
            <p style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 18 }}>
              This can't be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={secondaryButtonStyle} onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
              <button
                style={dangerButtonStyle}
                onClick={() => {
                  onDelete(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { fontSize: 11.5, color: COLORS.inkSoft, display: "block", marginBottom: 5 };
const rowGrid = { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 0.8fr" };
const iconBtn = {
  border: `1px solid ${COLORS.border}`,
  background: "#fff",
  borderRadius: 6,
  width: 28,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: COLORS.ink,
};
const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(27,37,33,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};
