import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: "Subscription tidak lengkap." }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin().from("push_subscriptions").upsert({
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      reminder_time: body.reminderTime || "20:00",
      enabled: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "endpoint" });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Subscription gagal disimpan." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { endpoint } = await request.json();
    const { error } = await getSupabaseAdmin().from("push_subscriptions").delete().eq("endpoint", endpoint);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return NextResponse.json({ error: "Subscription gagal dihapus." }, { status: 500 });
  }
}
