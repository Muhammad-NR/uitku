"use client";

import { startTransition, useEffect, useState } from "react";
import { Bell, Check, Moon, Settings, Sun, Smartphone, Send } from "lucide-react";
import AppDialog from "@/components/AppDialog";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [reminderTime, setReminderTime] = useState("20:00");
  const [dialog, setDialog] = useState<{ title: string; message: string; type: "error" | "info" } | null>(null);

  useEffect(() => {
    startTransition(() => {
      setTheme(localStorage.getItem("finance-theme") || "light");
      setNotifications(localStorage.getItem("finance-notifications") !== "off");
      setReminderTime(localStorage.getItem("finance-reminder-time") || "20:00");
      setPermission("Notification" in window ? Notification.permission : "unsupported");
    });
  }, []);

  useEffect(() => {
    if (!notifications || permission !== "granted") return;
    const [hours, minutes] = reminderTime.split(":").map(Number);
    const now = new Date();
    const nextReminder = new Date(now);
    nextReminder.setHours(hours, minutes, 0, 0);
    if (nextReminder <= now) nextReminder.setDate(nextReminder.getDate() + 1);
    const timer = window.setTimeout(async () => {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("Pengingat keuangan", {
        body: "Sudah mencatat transaksi hari ini?",
        icon: "/icon-192x192.webp",
        badge: "/icon-192x192.webp",
        tag: "uitku-daily-reminder",
      });
    }, nextReminder.getTime() - now.getTime());
    return () => window.clearTimeout(timer);
  }, [notifications, permission, reminderTime]);

  const changeTheme = (nextTheme: string) => {
    setTheme(nextTheme);
    localStorage.setItem("finance-theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const changeNotifications = () => {
    const nextValue = !notifications;
    setNotifications(nextValue);
    localStorage.setItem("finance-notifications", nextValue ? "on" : "off");
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setNotifications(true);
      localStorage.setItem("finance-notifications", "on");
      try {
        await subscribeToPush();
        await showReminder("Pengingat aktif", "Notifikasi pengingat keuangan sudah aktif.");
      } catch (error) {
        console.error("Gagal mengaktifkan notifikasi:", error);
        setDialog({ title: "Notifikasi belum aktif", message: "Izin perangkat sudah diberikan, tetapi layanan push belum dapat disiapkan. Coba lagi setelah service worker siap.", type: "error" });
      }
    }
  };

  const subscribeToPush = async (nextReminderTime = reminderTime) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const registration = await navigator.serviceWorker.ready;
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;
    const applicationServerKey = Uint8Array.from(atob(publicKey.replace(/-/g, "+").replace(/_/g, "/")), (character) => character.charCodeAt(0));
    const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...subscription.toJSON(), reminderTime: nextReminderTime }),
    });
  };

  const showReminder = async (title: string, body: string) => {
    if (permission !== "granted" && !("Notification" in window && Notification.permission === "granted")) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, { body, icon: "/icon-192x192.webp", badge: "/icon-192x192.webp", tag: "uitku-reminder" });
    } catch (error) {
      console.error("Gagal menampilkan notifikasi:", error);
      setDialog({ title: "Notifikasi tidak tersedia", message: "Browser belum dapat menampilkan notifikasi saat ini. Periksa izin notifikasi dan coba lagi.", type: "error" });
    }
  };

  const saveReminderTime = (value: string) => {
    setReminderTime(value);
    localStorage.setItem("finance-reminder-time", value);
    if (permission === "granted") void subscribeToPush(value);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pb-8">
      <header className="settings-header bg-[#f8fbf9]/95 backdrop-blur-md p-5 border-b border-[#dfe8e2]">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#146b55] mb-1">Preferensi</p>
        <h1 className="text-2xl font-bold tracking-tight text-[#17221d]">Pengaturan</h1>
        <p className="text-sm text-[#65736b] mt-1">Atur pengalaman Catatan Keuanganku.</p>
      </header>

      <section className="p-5 space-y-4">
        <div className="settings-card finance-panel bg-white border border-[#dfe8e2] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[#dff3e8] text-[#146b55]"><Settings size={18} /></div>
            <div><h2 className="text-[#17221d] font-bold">Tampilan</h2><p className="settings-muted text-xs text-[#65736b]">Pilih suasana aplikasi.</p></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => changeTheme("light")} className={`settings-option flex items-center justify-between rounded-xl border p-3 text-sm font-bold transition-all ${theme === "light" ? "border-[#146b55] bg-[#dff3e8] text-[#146b55]" : "border-[#dfe8e2] text-[#65736b]"}`}>
              <span className="flex items-center gap-2"><Sun size={17} /> Light</span>{theme === "light" && <Check size={16} />}
            </button>
            <button onClick={() => changeTheme("dark")} className={`settings-option flex items-center justify-between rounded-xl border p-3 text-sm font-bold transition-all ${theme === "dark" ? "border-[#f0c879] bg-[#334337] text-[#f0c879]" : "border-[#dfe8e2] text-[#65736b]"}`}>
              <span className="flex items-center gap-2"><Moon size={17} /> Dark</span>{theme === "dark" && <Check size={16} />}
            </button>
          </div>
        </div>

        <div className="settings-card finance-panel bg-white border border-[#dfe8e2] rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#fff3d8] text-[#b77b12]"><Bell size={18} /></div>
              <div><h2 className="text-[#17221d] font-bold">Notifikasi & reminder</h2><p className="settings-muted text-xs text-[#65736b]">Pengingat pencatatan transaksi.</p></div>
            </div>
            <button onClick={changeNotifications} aria-label="Ubah notifikasi" className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${notifications ? "bg-[#146b55]" : "bg-[#cbd6ce]"}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifications ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>
          <div className="settings-subpanel mt-4 rounded-xl bg-[#f4f8f5] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#65736b]"><Smartphone size={15} className="text-[#146b55]" /> Status perangkat: <span className={permission === "granted" ? "text-[#146b55]" : "text-[#b77b12]"}>{permission === "granted" ? "Diizinkan" : permission === "denied" ? "Diblokir" : permission === "unsupported" ? "Tidak didukung" : "Belum diizinkan"}</span></div>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <label className="settings-time flex items-center justify-between rounded-xl border border-[#dfe8e2] px-3 py-2.5 text-xs font-bold text-[#17221d]">Jam reminder<input type="time" value={reminderTime} onChange={(event) => saveReminderTime(event.target.value)} className="ml-2 border-0 bg-transparent p-0 text-sm text-[#146b55] outline-none" /></label>
            <button type="button" onClick={enableNotifications} className="flex items-center gap-2 rounded-xl bg-[#146b55] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#0d4e3e] transition-colors"><Bell size={15} /> Aktifkan</button>
          </div>
          <button type="button" onClick={() => showReminder("Catatan Keuanganku", "Sudah mencatat transaksi hari ini?")} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfe8e2] py-2.5 text-xs font-bold text-[#146b55] hover:bg-[#dff3e8] transition-colors"><Send size={14} /> Kirim notifikasi uji</button>
        </div>
      </section>
      <AppDialog isOpen={dialog !== null} title={dialog?.title || ""} message={dialog?.message || ""} type={dialog?.type || "info"} onClose={() => setDialog(null)} />
    </div>
  );
}
