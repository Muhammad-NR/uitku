import TransactionForm from "@/components/TransactionForm";

export default function Add() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
      <div className="bg-[#f8fbf9]/95 backdrop-blur-md p-5 border-b border-[#dfe8e2] sticky top-0 z-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#146b55] mb-1">Pencatatan baru</p>
        <h1 className="text-2xl font-bold tracking-tight text-[#17221d]">Tambah Transaksi</h1>
        <p className="text-sm text-[#65736b] mt-1">Simpan detail pemasukan atau pengeluaranmu.</p>
      </div>
      
      <TransactionForm />
    </div>
  );
}