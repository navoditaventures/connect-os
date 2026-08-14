import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, format } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const [contactsData, eventsData, interactionsData] = await Promise.all([
      supabase.from("contacts").select("*").eq("user_id", userId),
      supabase.from("events").select("*").eq("user_id", userId),
      supabase.from("interactions").select("*").eq("user_id", userId),
    ]);

    const contacts = contactsData.data || [];
    const events = eventsData.data || [];
    const interactions = interactionsData.data || [];

    if (format === "csv") {
      return exportAsCSV(contacts, events, interactions);
    }

    return NextResponse.json({
      contacts,
      events,
      interactions,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

function exportAsCSV(
  contacts: any[],
  events: any[],
  interactions: any[]
) {
  const contactsCSV = [
    ["ID", "Name", "Company", "Designation", "Phone", "WhatsApp", "Email", "Address", "Industry", "Type"],
    ...contacts.map((c) => [
      c.id,
      c.name,
      c.company || "",
      c.designation || "",
      c.phone || "",
      c.whatsapp || "",
      c.email || "",
      c.address || "",
      c.industry || "",
      c.contact_type,
    ]),
  ]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const eventsCSV = [
    ["ID", "Name", "Date", "Location", "Description"],
    ...events.map((e) => [e.id, e.name, e.date, e.location || "", e.description || ""]),
  ]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const interactionsCSV = [
    ["ID", "Contact ID", "Event ID", "Type", "Relationship", "Opportunity", "Stage", "Notes", "Follow-up Date", "Follow-up Status"],
    ...interactions.map((i) => [
      i.id,
      i.contact_id,
      i.event_id || "",
      i.interaction_type,
      i.relationship || "",
      i.opportunity || "",
      i.stage,
      i.notes || "",
      i.follow_up_date || "",
      i.follow_up_status,
    ]),
  ]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const csv = `CONTACTS\n${contactsCSV}\n\nEVENTS\n${eventsCSV}\n\nINTERACTIONS\n${interactionsCSV}`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="connectos-export.csv"',
    },
  });
}
