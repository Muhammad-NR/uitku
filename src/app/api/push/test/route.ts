import { NextResponse } from "next/server";
import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

webpush.setVapidDetails(
  "mailto:admin@uitku.app",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function POST() {
  const { data: subscriptions, error } = await getSupabaseAdmin().from("push_subscriptions").select("endpoint, p256dh, auth").eq("enabled", true);
  if (error) return NextResponse.json({ error: "Gagal mengambil subscription." }, { status: 500 });

  const results = await Promise.allSettled((subscriptions || []).map((subscription) => webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify({ title: "Catatan Keuanganku", body: "Sudah mencatat transaksi hari ini?", url: "/add" }))));
  return NextResponse.json({ ok: true, sent: results.filter((result) => result.status === "fulfilled").length });
}
