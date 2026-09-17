import { NextResponse } from "next/server";
import webpush from "web-push";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

webpush.setVapidDetails("mailto:admin@uitku.app", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "", process.env.VAPID_PRIVATE_KEY || "");

export async function POST(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const currentTime = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" }).format(new Date());
  const { data: subscriptions, error } = await getSupabaseAdmin().from("push_subscriptions").select("endpoint, p256dh, auth").eq("enabled", true).eq("reminder_time", currentTime);
  if (error) return NextResponse.json({ error: "Gagal mengambil reminder." }, { status: 500 });

  const results = await Promise.allSettled((subscriptions || []).map((subscription) => webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify({ title: "Pengingat keuangan", body: "Sudah mencatat transaksi hari ini?", url: "/add" }))));
  return NextResponse.json({ ok: true, time: currentTime, sent: results.filter((result) => result.status === "fulfilled").length });
}

export async function GET(request: Request) {
  return POST(request);
}
