"use client";

import { startTransition, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db/localDb";
import { formatRupiah, parseRupiah } from "@/utils/currencyFormat";
import { useLiveQuery } from "dexie-react-hooks";
import { useRouter } from "next/navigation";
import CategoryModal from "./CategoryModal"; // <-- Import Modal baru kita
import AppDialog from "./AppDialog";
import { ArrowDownToLine, ArrowUpFromLine, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, FileText, Plus, Tag, WalletCards } from "lucide-react";

export default function TransactionForm() {
  const router = useRouter();
  
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  
  // State buat ngontrol pop-up modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message: string; type: "success" | "error" | "info" } | null>(null);

  const categories = useLiveQuery(
    () => db.categories.filter(c => c.type === type && !c.is_deleted).toArray(),
    [type]
  );

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    startTransition(() => setDate(today));
  }, []);

  // --- LOGIKA KATEGORI BARU ---
  const handleCategoryChange = (value: string) => {
    if (value === "ADD_NEW") {
      setIsModalOpen(true); // Buka pop-up
      setCategoryId("");    // Kosongin pilihan sementara biar gak stuck di "Tambah Lainnya"
    } else {
      setCategoryId(value);
    }
    setIsCategoryOpen(false);
  };

  const selectedCategory = categories?.find((category) => category.id === categoryId);

  const formatDateLabel = (value: string) => {
    if (!value) return "Pilih tanggal transaksi";
    return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  };

  const selectDate = (day: number) => {
    const year = calendarMonth.getFullYear();
    const month = String(calendarMonth.getMonth() + 1).padStart(2, "0");
    setDate(`${year}-${month}-${String(day).padStart(2, "0")}`);
    setIsDateOpen(false);
  };

  const setToday = () => {
    const today = new Date();
    const todayValue = today.toISOString().split("T")[0];
    setDate(todayValue);
    setCalendarMonth(today);
    setIsDateOpen(false);
  };

  const handleSaveNewCategory = async (name: string) => {
    const newId = uuidv4();
    try {
      await db.categories.add({
        id: newId,
        name,
        type,
        created_at: Date.now(),
        updated_at: Date.now(),
        is_deleted: false,
      });
      // Otomatis pilih kategori yang baru dibikin dan tutup modal
      setCategoryId(newId);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Gagal buat kategori:", error);
      setDialog({ title: "Kategori belum tersimpan", message: "Terjadi masalah saat membuat kategori baru. Coba lagi.", type: "error" });
    }
  };
  // -----------------------------

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseRupiah(rawValue);
    
    if (numericValue === 0 && rawValue !== "") {
      setAmountDisplay("");
    } else {
      setAmountDisplay(formatRupiah(numericValue));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseRupiah(amountDisplay);

    if (numericAmount <= 0) {
      setDialog({ title: "Nominal belum diisi", message: "Masukkan nominal yang lebih besar dari Rp 0 untuk melanjutkan.", type: "info" });
      return;
    }
    
    if (!categoryId) {
      setDialog({ title: "Kategori belum dipilih", message: "Pilih kategori transaksi agar pencatatanmu lebih rapi.", type: "info" });
      return;
    }

    try {
      await db.transactions.add({
        id: uuidv4(),
        amount: numericAmount,
        type,
        category_id: categoryId,
        date: new Date(date).getTime(),
        note,
        created_at: Date.now(),
        updated_at: Date.now(),
        is_deleted: false,
      });

      router.push("/history"); 
    } catch (error) {
      console.error("Gagal nyimpen:", error);
      setDialog({ title: "Transaksi belum tersimpan", message: "Terjadi masalah saat menyimpan transaksi. Silakan coba lagi.", type: "error" });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-5 text-black">
        <div className={`finance-form-card finance-ticket bg-white border rounded-[26px] p-5 ${type === "INCOME" ? "[--ticket-accent:#16a34a]" : "[--ticket-accent:#dc2626]"}`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#65736b]">Ticket keuangan</p>
              <p className="font-bold text-[#17221d] mt-1">Detail transaksi</p>
            </div>
            <div className={`p-3 rounded-2xl ${type === "INCOME" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
              <WalletCards size={20} />
            </div>
          </div>

        {/* Pilihan Tipe */}
        <div className="grid grid-cols-2 gap-1 bg-[#edf2ee] p-1.5 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
              type === "EXPENSE" ? "bg-white text-red-600 shadow-md" : "text-[#65736b] hover:text-red-600"
            }`}
          >
            <ArrowDownToLine size={17} />
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={`flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
              type === "INCOME" ? "bg-white text-green-600 shadow-md" : "text-[#65736b] hover:text-green-600"
            }`}
          >
            <ArrowUpFromLine size={17} />
            Pemasukan
          </button>
        </div>

        {/* Input Nominal */}
        <div className="rounded-2xl bg-[#f4f8f5] border border-[#e4ece6] p-4 mb-5">
          <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#65736b] mb-2"><WalletCards size={14} /> Nominal transaksi</label>
          <input
            type="text"
            inputMode="numeric"
            value={amountDisplay}
            onChange={handleAmountChange}
            placeholder="0"
            className="w-full text-4xl font-bold tracking-tight p-0 border-0 outline-none bg-transparent text-[#17221d] placeholder-[#aab8af] focus:ring-0"
          />
        </div>

        {/* Input Kategori */}
        <div className="finance-field finance-field-category flex flex-col mb-4">
          <label className="flex items-center gap-2 text-xs font-bold text-[#17221d] mb-2"><Tag size={15} className="text-[#146b55]" /> Kategori</label>
          <div className="relative">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${categoryId ? "bg-[#146b55] shadow-[0_0_0_4px_#dff3e8]" : "bg-[#b8c8be]"}`} />
            <button
              type="button"
              onClick={() => setIsCategoryOpen((isOpen) => !isOpen)}
              aria-haspopup="listbox"
              aria-expanded={isCategoryOpen}
              className={`finance-select w-full flex items-center justify-between p-4 pl-10 pr-4 bg-white border rounded-2xl outline-none text-left font-semibold transition-all ${isCategoryOpen ? "border-[#66b795] ring-4 ring-[#dff3e8]" : "border-[#dfe8e2] hover:border-[#9bd5bd]"}`}
            >
              <span className={selectedCategory ? "text-black" : "text-[#829188]"}>
                {selectedCategory?.name || "Pilih kategori transaksi"}
              </span>
              <ChevronDown size={18} className={`text-[#146b55] transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} />
            </button>
            {isCategoryOpen && (
              <div role="listbox" aria-label="Pilih kategori" className="finance-category-menu absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-[#dfe8e2] bg-white p-1.5 shadow-[0_18px_35px_rgba(33,67,50,0.16)] animate-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#829188]">Kategori tersedia</div>
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    role="option"
                    aria-selected={category.id === categoryId}
                    onClick={() => handleCategoryChange(category.id)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#17221d] transition-colors hover:bg-[#dff3e8]"
                  >
                    <span className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-[#146b55]" />{category.name}</span>
                    {category.id === categoryId && <Check size={17} className="text-[#146b55]" />}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleCategoryChange("ADD_NEW")}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-[#edf2ee] px-3 py-3 text-left text-sm font-bold text-[#146b55] transition-colors hover:bg-[#fff3d8]"
                >
                  <span className="rounded-lg bg-[#fff3d8] p-1.5 text-[#b77b12]"><Plus size={15} /></span>
                  Tambah kategori baru
                </button>
              </div>
            )}
          </div>
          <span className="mt-2 ml-1 text-[11px] font-medium text-[#829188]">Pilih pos pengeluaran agar laporanmu lebih akurat.</span>
        </div>

        {/* Input Tanggal */}
        <div className="finance-field finance-field-date flex flex-col mb-4">
          <label className="flex items-center gap-2 text-xs font-bold text-[#17221d] mb-2"><CalendarDays size={15} className="text-[#146b55]" /> Tanggal transaksi</label>
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-xl bg-[#fff3d8] p-2 text-[#b77b12]">
              <CalendarDays size={17} />
            </div>
            <button
              type="button"
              onClick={() => setIsDateOpen((isOpen) => !isOpen)}
              aria-haspopup="dialog"
              aria-expanded={isDateOpen}
              className={`finance-date-input w-full flex items-center justify-between p-4 pl-16 pr-4 bg-white border rounded-2xl outline-none text-left font-semibold transition-all ${isDateOpen ? "border-[#66b795] ring-4 ring-[#dff3e8]" : "border-[#dfe8e2] hover:border-[#9bd5bd]"}`}
            >
              <span className={date ? "text-black" : "text-[#829188]"}>{formatDateLabel(date)}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#b77b12]">Ubah</span>
            </button>
            {isDateOpen && (
              <div className="finance-date-menu absolute left-0 right-0 bottom-[calc(100%+8px)] z-30 rounded-2xl border border-[#dfe8e2] bg-white p-4 shadow-[0_18px_35px_rgba(33,67,50,0.16)] animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#829188]">Pilih tanggal</p>
                    <p className="font-bold text-[#17221d] mt-1">{calendarMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" aria-label="Bulan sebelumnya" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="rounded-xl p-2 text-[#65736b] hover:bg-[#dff3e8] hover:text-[#146b55] transition-colors"><ChevronLeft size={18} /></button>
                    <button type="button" aria-label="Bulan berikutnya" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="rounded-xl p-2 text-[#65736b] hover:bg-[#dff3e8] hover:text-[#146b55] transition-colors"><ChevronRight size={18} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-[#829188] mb-2">
                  {['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map((dayName) => <span key={dayName}>{dayName}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getCalendarDays().map((day, index) => {
                    const dayValue = day ? `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                    const isSelected = dayValue === date;
                    return day ? <button key={dayValue} type="button" onClick={() => selectDate(day)} className={`aspect-square rounded-xl text-sm font-semibold transition-all ${isSelected ? "bg-[#146b55] text-white shadow-md" : "text-[#17221d] hover:bg-[#dff3e8] hover:text-[#146b55]"}`}>{day}</button> : <span key={`empty-${index}`} />;
                  })}
                </div>
                <button type="button" onClick={setToday} className="mt-4 w-full rounded-xl border border-[#dfe8e2] py-2.5 text-xs font-bold text-[#146b55] hover:bg-[#fff3d8] transition-colors">Gunakan hari ini</button>
              </div>
            )}
          </div>
          <span className="mt-2 ml-1 text-[11px] font-medium text-[#829188]">Kapan transaksi ini terjadi?</span>
        </div>

        {/* Input Catatan */}
        <div className="flex flex-col">
          <label className="flex items-center gap-2 text-xs font-bold text-[#17221d] mb-2"><FileText size={15} className="text-[#146b55]" /> Catatan <span className="font-medium text-[#65736b]">(opsional)</span></label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ketik catatan di sini..."
            rows={2}
            className="p-3.5 bg-white border border-[#dfe8e2] rounded-xl outline-none focus:ring-2 focus:ring-[#9bd5bd] text-black font-medium placeholder-[#9aa9a0] transition-shadow resize-none"
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-[#146b55] text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_rgba(20,107,85,0.2)] hover:bg-[#0d4e3e] hover:-translate-y-0.5 active:scale-[0.98] transition-all"
        >
          Simpan transaksi
        </button>
        </div>
      </form>

      {/* Panggil komponen pop-up di bawah form */}
      <CategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNewCategory}
        type={type}
      />
      <AppDialog
        isOpen={dialog !== null}
        title={dialog?.title || ""}
        message={dialog?.message || ""}
        type={dialog?.type || "info"}
        onClose={() => setDialog(null)}
      />
    </>
  );
}