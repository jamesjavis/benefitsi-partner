import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "leads.json");

function readLeads() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

export async function GET() {
  try {
    const leads = readLeads();
    return NextResponse.json({ leads, count: leads.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const leads = readLeads();
    
    const newLead = {
      id: Date.now().toString(),
      ...body,
      receivedAt: new Date().toISOString(),
    };
    
    leads.unshift(newLead); // newest first
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2));
    
    return NextResponse.json({ ok: true, lead: newLead });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}