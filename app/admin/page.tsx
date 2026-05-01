"use client";

import { useState, useEffect } from "react";

interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;
  category?: string;
  location?: string;
  message?: string;
  timestamp: string;
  source?: string;
  status?: "new" | "contacted" | "interested" | "signed" | "declined";
  notes?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  gastro: "Gastronomie / Café / Bistro",
  retail: "Einzelhandel",
  service: "Dienstleistung",
  food: "Lebensmittel / Bäckerei / Metzgerei",
  other: "Sonstiges",
};

const STATUS_COLORS: Record<string, string> = {
  new: "#a855f7",
  contacted: "#3b82f6",
  interested: "#f59e0b",
  signed: "#22c55e",
  declined: "#ef4444",
};

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");

  async function fetchLeads() {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch {
      setError("Fehler beim Laden der Leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLeads(); }, []);

  async function updateLead(id: string, updates: Partial<Lead>) {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchLeads();
      setEditingId(null);
    } catch {
      alert("Update fehlgeschlagen.");
    }
  }

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  const statusCounts = {
    all: leads.length,
    new: leads.filter((l) => l.status === "new" || !l.status).length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    interested: leads.filter((l) => l.status === "interested").length,
    signed: leads.filter((l) => l.status === "signed").length,
    declined: leads.filter((l) => l.status === "declined").length,
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#fff" }}>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>Lade Leads...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "4px" }}>Benefitsi Lead Dashboard</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>{leads.length} Anfragen gesamt</p>
          </div>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px", padding: "10px 20px", color: "#fff", cursor: "pointer", fontSize: "0.875rem",
            }}
          >
            ← Zurück zur Landing Page
          </button>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "16px", marginBottom: "24px", color: "#ef4444" }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", flexWrap: "wrap" }}>
          {(["all", "new", "contacted", "interested", "signed", "declined"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: filter === f ? STATUS_COLORS[f] || "#a855f7" : "rgba(255,255,255,0.12)",
                background: filter === f ? `${STATUS_COLORS[f] || "#a855f7"}22` : "rgba(255,255,255,0.04)",
                color: filter === f ? (STATUS_COLORS[f] || "#a855f7") : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {f === "all" ? `Alle (${statusCounts.all})` : `${f} (${statusCounts[f]})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)" }}>
            <p style={{ fontSize: "2rem", marginBottom: "12px" }}>📭</p>
            <p>Keine Leads in dieser Kategorie.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((lead) => (
              <div
                key={lead.id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                {editingId === lead.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <label style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "6px 12px", color: "#fff" }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="interested">Interested</option>
                        <option value="signed">Signed</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Notizen..."
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "10px", color: "#fff", fontSize: "0.875rem", minHeight: "60px", resize: "vertical" }}
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => updateLead(lead.id, { status: editStatus as Lead["status"], notes: editNotes })}
                        style={{ background: "#22c55e", border: "none", borderRadius: "8px", padding: "8px 20px", color: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "0.875rem" }}
                      >
                        ✅ Speichern
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", padding: "8px 20px", color: "#fff", cursor: "pointer", fontSize: "0.875rem" }}
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{lead.businessName}</h3>
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: `${(lead.status ? STATUS_COLORS[lead.status] : "#a855f7") || "#a855f7"}22`,
                          color: lead.status ? STATUS_COLORS[lead.status] : "#a855f7",
                        }}>
                          {lead.status || "new"}
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                        <div>👤 <strong style={{ color: "rgba(255,255,255,0.85)" }}>{lead.contactName}</strong></div>
                        <div>📧 <a href={`mailto:${lead.email}`} style={{ color: "#60a5fa" }}>{lead.email}</a></div>
                        {lead.phone && <div>📱 {lead.phone}</div>}
                        {lead.category && <div>🏷️ {CATEGORY_LABELS[lead.category] || lead.category}</div>}
                        {lead.location && <div>📍 {lead.location}</div>}
                        <div>🕐 {new Date(lead.timestamp).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}</div>
                      </div>
                      {lead.message && (
                        <div style={{ marginTop: "12px", padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                          💬 {lead.message}
                        </div>
                      )}
                      {lead.notes && (
                        <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>
                          📝 {lead.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                      <button
                        onClick={() => { setEditingId(lead.id); setEditStatus(lead.status || "new"); setEditNotes(lead.notes || ""); }}
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "8px 16px", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "0.8rem" }}
                      >
                        Bearbeiten
                      </button>
                      <a
                        href={`mailto:${lead.email}?subject=Benefitsi – Next Steps&body=Hallo ${lead.contactName},%0A%0Adanke für dein Interesse an Benefitsi! Wir würden uns freuen, dir das System in einem kurzen call vorzustellen.%0A%0ABeste Grüße%0ABenefitsi Team`}
                        style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", padding: "8px 16px", color: "#c084fc", fontSize: "0.8rem", textDecoration: "none", textAlign: "center" }}
                      >
                        📧 E-Mail schreiben
                      </a>
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", padding: "8px 16px", color: "#4ade80", fontSize: "0.8rem", textDecoration: "none", textAlign: "center" }}
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}