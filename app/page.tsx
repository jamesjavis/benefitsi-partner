"use client";
import { useState, useRef } from "react";

export default function PartnerLanding() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      businessName: formData.get("businessName") as string,
      contactName: formData.get("contactName") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      category: formData.get("category") as string,
      location: formData.get("location") as string,
      message: formData.get("message") as string,
      timestamp: new Date().toISOString(),
      source: "partner-landing-v2",
    };

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      setStatus("success");
      form.reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setErrorMsg(`Fehler: ${message}. Schreib uns direkt: benefitsi@pm.me`);
      setStatus("error");
    }
  }

  return (
    <>
      <div className="bg" />
      <div className="content">
        <div className="badge">
          <span /> Partner-Programm — Annweiler & Umgebung
        </div>

        <h1>
          Lokale Geschäfte.<br />Neue Stammkunden.
        </h1>
        <p className="subtitle">
          Benefitsi bringt Treueprogramm und Kundenbindung auf ein neues Level.
          Ohne App-Download, ohne Kontaktlos-Chip — einfach scannen, Punkte sammeln, Rabatte sichern.
        </p>

        <div className="how-it-works">
          <p className="section-label">So funktioniert&apos;s</p>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div>
                <h3>QR-Code aufhängen</h3>
                <p>Wir liefern einen individuellen QR-Code. Du hängst ihn an die Theke, Tür oder Kasse. Kein Gerät, keine Installation — nada.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div>
                <h3>Kunde scannt & sammelt</h3>
                <p>Kunde fotografiert den Code mit dem Smartphone — keine App, kein Login. Sofort im Browser Punkte sammeln.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div>
                <h3>Du belohnst Treue</h3>
                <p>Stempel, Punkte, Badges — flexibel konfigurierbar. Sobald ein Kunde das Ziel erreicht, wird der Rabatt eingelöst.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="benefits">
          <p className="section-label">Vorteile für dein Geschäft</p>
          <div className="benefits-grid">
            <div className="benefit">
              <div className="benefit-icon">📱</div>
              <h3>Keine App nötig</h3>
              <p>Kunden brauchen keine App zu installieren. Browser reicht.</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">⚡</div>
              <h3>Sofort einsatzbereit</h3>
              <p>QR-Code drucken, aufhängen, fertig. In unter 5 Minuten startklar.</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">💸</div>
              <h3>Kostenlos für Partner</h3>
              <p>Keine monatlichen Gebühren. Du zahlst nur die Rabatte, die du gibst.</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">📊</div>
              <h3>Ein Dashboard</h3>
              <p>Sieh auf einen Blick, wie viele Stammkunden du hast und wie oft sie kommen.</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">🎯</div>
              <h3>Adressierte Kunden</h3>
              <p>Du erreichst Stammkunden gezielt — nicht nur vorbeischlendernde Laufkundschaft.</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">🤝</div>
              <h3>Netzwerk-Effekt</h3>
              <p>Ein System, mehrere Geschäfte — Kunden werden ermutigt, auch andere lokale Partner zu besuchen.</p>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Interesse? Jetzt Partner werden.</h2>
          <p className="form-subtitle">Fülle das Formular aus — wir melden uns innerhalb von 48 Stunden.</p>

          {status === "success" ? (
            <div className="success-msg show">
              <div className="icon">✅</div>
              <h3>Anfrage gesendet!</h3>
              <p>Danke für dein Interesse. Wir melden uns innerhalb von 48 Stunden bei dir.</p>
            </div>
          ) : (
            <>
              {status === "error" && (
                <div className="error-msg show">{errorMsg}</div>
              )}
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="form-row full">
                  <label htmlFor="businessName">Name des Geschäfts *</label>
                  <input type="text" id="businessName" name="businessName" placeholder="z.B. Café am Markt" required />
                </div>
                <div className="form-row">
                  <div>
                    <label htmlFor="contactName">Ansprechpartner *</label>
                    <input type="text" id="contactName" name="contactName" placeholder="Dein Name" required />
                  </div>
                  <div>
                    <label htmlFor="phone">Telefon / WhatsApp</label>
                    <input type="tel" id="phone" name="phone" placeholder="+49 123 456789" />
                  </div>
                </div>
                <div className="form-row full">
                  <label htmlFor="email">E-Mail *</label>
                  <input type="email" id="email" name="email" placeholder="hallo@meingeschäft.de" required />
                </div>
                <div className="form-row">
                  <div>
                    <label htmlFor="category">Branche *</label>
                    <select id="category" name="category" required>
                      <option value="" disabled selected>Bitte wählen</option>
                      <option value="gastro">Gastronomie / Café / Bistro</option>
                      <option value="retail">Einzelhandel</option>
                      <option value="service">Dienstleistung (Friseur, Fitness…)</option>
                      <option value="food">Lebensmittel / Bäckerei / Metzgerei</option>
                      <option value="other">Sonstiges</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="location">Standort</label>
                    <input type="text" id="location" name="location" placeholder="Annweiler, Pirmasens…" />
                  </div>
                </div>
                <div className="form-row full">
                  <label htmlFor="message">Etwas, das du uns mitteilen möchtest?</label>
                  <textarea id="message" name="message" placeholder="Öffnungszeiten, besondere Angebote, Fragen…" />
                </div>

                <button type="submit" className="btn" disabled={status === "loading"}>
                  <span>🚀</span> {status === "loading" ? "Wird gesendet…" : "Anfrage absenden"}
                </button>
              </form>
            </>
          )}

          <div className="trust">
            <div className="trust-item"><span>🔒</span> Keine Provision</div>
            <div className="trust-item"><span>📱</span> Keine App nötig</div>
            <div className="trust-item"><span>⚡</span> Schnell eingerichtet</div>
            <div className="trust-item"><span>💬</span> Persönlicher Support</div>
          </div>
        </div>

        <div className="contact-alt">
          <a href="mailto:benefitsi@pm.me?subject=Benefitsi Partneranfrage">
            Oder schreib uns direkt: benefitsi@pm.me
          </a>
        </div>
      </div>
    </>
  );
}
