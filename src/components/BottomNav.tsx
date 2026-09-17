"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, PlusCircle, BarChart2, Settings } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Beranda", path: "/", icon: Home },
    { name: "Riwayat", path: "/history", icon: List },
    { name: "Tambah", path: "/add", icon: PlusCircle },
    { name: "Laporan", path: "/reports", icon: BarChart2 },
    { name: "Pengaturan", path: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-[#dfe8e2] pb-safe-bottom z-40 shadow-[0_-8px_24px_rgba(33,67,50,0.08)]">
      <div className="grid grid-cols-5 items-center px-2 py-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`group flex flex-col items-center p-2 transition-all duration-300 ${index === 2 ? "z-10" : ""} ${
                isActive ? "text-[#146b55] font-bold -translate-y-0.5" : "text-[#65736b] hover:text-[#146b55]"
              }`}
            >
              {item.name === "Tambah" ? (
                <div className="absolute -top-5 bg-[#146b55] text-white p-3 rounded-2xl shadow-[0_8px_18px_rgba(20,107,85,0.28)] transition-transform duration-300 group-hover:scale-105">
                  <Icon size={24} />
                </div>
              ) : (
                <Icon size={24} />
              )}
              <span className={`text-[10px] mt-1 ${item.name === "Tambah" ? "mt-6" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}