// Skema untuk Kategori
export interface Category {
  id: string; // UUID
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  created_at: number;
  updated_at: number;
  is_deleted: boolean;
}

// Skema untuk Transaksi
export interface Transaction {
  id: string; // UUID
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category_id: string;
  date: number; // Disimpan dalam bentuk milidetik (timestamp)
  note?: string;
  created_at: number;
  updated_at: number;
  is_deleted: boolean;
}
import Dexie, { type Table } from "dexie";

export class FinanceDB extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;

  constructor() {
    super("PersonalFinanceDB");
    this.version(1).stores({
      categories: "id, type, updated_at, is_deleted",
      transactions: "id, type, category_id, date, updated_at, is_deleted",
    });
    this.version(2).stores({
      categories: "id, type, updated_at, is_deleted",
      transactions: "id, type, category_id, date, updated_at, is_deleted",
      pendingOperations: "++id, entity, action, created_at",
    });
  }
}

export const db = new FinanceDB();

export async function syncFinanceData() {
  return;
}

if (typeof window !== "undefined") {
  void db.open().then(async () => {
    const defaults: Category[] = [
      { id: "default-food", name: "Makanan", type: "EXPENSE", created_at: 0, updated_at: 0, is_deleted: false },
      { id: "default-transport", name: "Transportasi", type: "EXPENSE", created_at: 0, updated_at: 0, is_deleted: false },
      { id: "default-bills", name: "Tagihan", type: "EXPENSE", created_at: 0, updated_at: 0, is_deleted: false },
      { id: "default-salary", name: "Gaji", type: "INCOME", created_at: 0, updated_at: 0, is_deleted: false },
      { id: "default-other-income", name: "Pemasukan lain", type: "INCOME", created_at: 0, updated_at: 0, is_deleted: false },
    ];
    const existing = new Set((await db.categories.bulkGet(defaults.map((category) => category.id))).filter(Boolean).map((category) => category!.id));
    const missing = defaults.filter((category) => !existing.has(category.id));
    if (missing.length > 0) await db.categories.bulkAdd(missing);
  });
}

