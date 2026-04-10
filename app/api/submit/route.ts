import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = "benefitsi@pm.me";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, contactName, phone, email, category, location, message, timestamp } = body;

    if (!businessName || !contactName || !email) {
      return NextResponse.json({ error: "Pflichtfelder fehlen." }, { status: 400 });
    }

    const categoryLabel: Record<string, string> = {
      gastro: "Gastronomie / Café / Bistro",
      retail: "Einzelhandel",
      service: "Dienstleistung",
      food: "Lebensmittel / Bäckerei / Metzgerei",
      other: "Sonstiges",
    };

    const html = `
      <h2>Neue Benefitsi Partneranfrage</h2>
      <p><strong>Zeit:</strong> ${new Date(timestamp).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}</p>
      <hr />
      <p><strong>🏪 Geschäft:</strong> ${businessName}</p>
      <p><strong>👤 Ansprechpartner:</strong> ${contactName}</p>
      <p><strong>📧 E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>📱 Telefon:</strong> ${phone || "—"}</p>
      <p><strong>🏷️ Branche:</strong> ${categoryLabel[category] || category}</p>
      <p><strong>📍 Standort:</strong> ${location || "—"}</p>
      ${message ? `<p><strong>💬 Nachricht:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>` : ""}
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Benefitsi <onboarding@resend.dev>",
        to: [TO_EMAIL],
        subject: `Benefitsi Partneranfrage: ${businessName}`,
        html,
        replyTo: email,
      });
    } else {
      // No Resend key — log and return success (MVP fallback)
      console.log("=== BENEFITSI FORM SUBMISSION (no RESEND_API_KEY) ===");
      console.log({ businessName, contactName, phone, email, category, location, message, timestamp });
      console.log("Add RESEND_API_KEY to .env.local to enable email delivery.");
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("Form submission error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
