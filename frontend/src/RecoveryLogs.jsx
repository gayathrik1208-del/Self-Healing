import React, { useMemo, useState } from "react";
import { ShieldCheck, ShieldAlert, Activity } from "lucide-react";
import { COLORS, cardStyle } from "./tokens";

function statusMeta(status) {
  switch (status) {
    case "recovered":
      return { label: "Recovered", fg: COLORS.teal, bg: COLORS.tealSoft, Icon: ShieldCheck };
    case "monitoring":
      return { label: "Monitoring", fg: COLORS.amber, bg: COLORS.amberSoft, Icon: Activity };
    case "failed":
      return { label: "Failed", fg: COLORS.rose, bg: COLORS.roseSoft, Icon: ShieldAlert };
    default:
      return { label: status, fg: COLORS.inkSoft, bg: "#EFEFEF", Icon: Activity };
  }
}

export default function RecoveryLogs({ logs }) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => logs.filter((l) => filter === "all" || l.status === filter), [logs, filter]);

  const summary = useMemo(() => {
    const recovered = logs.filter((l) => l.status === "recovered").length;
    const monitoring = logs.filter((l) => l.status === "monitoring").length;
    const failed = logs.filter((l) => l.status === "failed").length;
    return { recovered, monitoring, failed };
  }, [logs]);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, margin: 0 }}>
          Recovery logs
        </h1>
        <p style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 4 }}>
          Automated actions taken by the health-checker
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Recovered", value: summary.recovered, color: COLORS.teal },
          { label: "Monitoring", value: summary.monitoring, color: COLORS.amber },
          { label: "Failed", value: summary.failed, color: COLORS.rose },
        ].map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 600, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["all", "recovered", "monitoring", "failed"].map((f) => (
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

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((log) => {
          const meta = statusMeta(log.status);
          const Icon = meta.Icon;
          return (
            <div key={log.id} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: meta.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color={meta.fg} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                    {log.service}{" "}
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: COLORS.inkSoft, fontWeight: 400 }}>
                      {log.id}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 2 }}>{log.issue}</div>
                  <div style={{ fontSize: 12.5, color: COLORS.ink, marginTop: 2 }}>→ {log.action}</div>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: meta.fg, background: meta.bg, borderRadius: 6, padding: "3px 8px" }}>
                  {meta.label}
                </span>
                <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 6 }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div style={{ fontSize: 11.5, color: COLORS.inkSoft, fontFamily: "'JetBrains Mono', monospace" }}>
                  {log.durationSec}s
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ ...cardStyle, textAlign: "center", color: COLORS.inkSoft, fontSize: 13.5 }}>
            No recovery events match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
