export const COLORS = {
  bg: "#EEF1EE",
  card: "#FFFFFF",
  ink: "#1B2521",
  inkSoft: "#5B655F",
  border: "#D7DDDA",
  teal: "#2F6F63",
  tealSoft: "#E4EEEC",
  amber: "#C97A2B",
  amberSoft: "#F7EADA",
  rose: "#B85C5C",
  roseSoft: "#F5E6E6",
  green: "#3F8F5F",
  greenSoft: "#E4EFE6",
};

export const inputStyle = {
  width: "100%",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13.5,
  outline: "none",
  color: COLORS.ink,
  background: "#fff",
  boxSizing: "border-box",
};

export const primaryButtonStyle = {
  border: "none",
  borderRadius: 8,
  padding: "9px 14px",
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  background: COLORS.ink,
  color: "#fff",
};

export const secondaryButtonStyle = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "9px 14px",
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  background: "#fff",
  color: COLORS.ink,
};

export const dangerButtonStyle = {
  border: "none",
  borderRadius: 8,
  padding: "9px 14px",
  fontSize: 13.5,
  fontWeight: 600,
  cursor: "pointer",
  background: COLORS.rose,
  color: "#fff",
};

export const cardStyle = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: 20,
};
