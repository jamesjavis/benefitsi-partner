import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const TO_EMAIL = "benefitsi@pm.me";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

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

    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: "Benefitsi <onboarding@resend.dev>",
        to: [TO_EMAIL],
        subject: `Benefitsi Partneranfrage: ${businessName}`,
        html,
        replyTo: email,
      });
    } else {
      console.log("=== BENEFITSI FORM SUBMISSION (no RESEND_API_KEY) ===");
      console.log({ businessName, contactName, phone, email, category, location, message, timestamp });
      console.log("Add RESEND_API_KEY to .env.local to enable email delivery.");
    }

    // Save lead to local JSON file for admin dashboard
    const DATA_FILE = path.join(process.cwd(), "data", "leads.json");
    const leads = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) : [];
    const newLead = {
      id: Date.now().toString(),
      businessName, contactName, email, phone: phone || "",
      category: category || "", location: location || "",
      message: message || "", timestamp, source: "partner-landing-v2",
      status: "new",
    };
    leads.unshift(newLead);
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2));

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("Form submission error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
