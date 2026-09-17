import { createRemoteCategory, createRemoteTransaction, getRemoteCategories, getRemoteTransactions, softDeleteRemoteTransaction } from "@/db/supabaseDb";
import { isSupabaseConfigured } from "@/lib/supabase";

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

interface PendingOperation {
  id?: number;
  entity: "category" | "transaction";
  action: "create" | "delete";
  payload: Category | Transaction | { id: string };
  created_at: number;
}

export class FinanceDB extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  pendingOperations!: Table<PendingOperation, number>;

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

const isOnline = () => typeof navigator === "undefined" || navigator.onLine;

async function queueOperation(operation: Omit<PendingOperation, "id">) {
  await db.pendingOperations.add(operation);
}

async function flushPendingOperations() {
  if (!isOnline()) return;
  const operations = await db.pendingOperations.orderBy("id").toArray();

  for (const operation of operations) {
    try {
      if (operation.entity === "category" && operation.action === "create") {
        await createRemoteCategory(operation.payload as Category);
      } else if (operation.entity === "transaction" && operation.action === "create") {
        await createRemoteTransaction(operation.payload as Transaction);
      } else if (operation.entity === "transaction" && operation.action === "delete") {
        await softDeleteRemoteTransaction((operation.payload as { id: string }).id);
      }
      if (operation.id !== undefined) await db.pendingOperations.delete(operation.id);
    } catch {
      break;
    }
  }
}

export async function syncFinanceData() {
  if (!isOnline() || !isSupabaseConfigured) return;
  try {
    await flushPendingOperations();
    const [categories, transactions] = await Promise.all([getRemoteCategories(), getRemoteTransactions()]);
    await db.transaction("rw", db.categories, db.transactions, async () => {
      await db.categories.bulkPut(categories);
      await db.transactions.bulkPut(transactions);
    });
  } catch {
    // Offline or auth-disabled: local data remains available and queued.
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => { void syncFinanceData(); });
  void syncFinanceData();
}

const originalCategoryAdd = db.categories.add.bind(db.categories);
db.categories.add = ((category) => {
  const localWrite = originalCategoryAdd(category);
  void localWrite.then(async () => {
    try {
      if (isOnline() && isSupabaseConfigured) await createRemoteCategory(category);
      else throw new Error("offline");
    } catch {
      await queueOperation({ entity: "category", action: "create", payload: category, created_at: Date.now() });
    }
  });
  return localWrite;
}) as typeof db.categories.add;

const originalTransactionAdd = db.transactions.add.bind(db.transactions);
db.transactions.add = ((transaction) => {
  const localWrite = originalTransactionAdd(transaction);
  void localWrite.then(async () => {
    try {
      if (isOnline() && isSupabaseConfigured) await createRemoteTransaction(transaction);
      else throw new Error("offline");
    } catch {
      await queueOperation({ entity: "transaction", action: "create", payload: transaction, created_at: Date.now() });
    }
  });
  return localWrite;
}) as typeof db.transactions.add;

const originalTransactionUpdate = db.transactions.update.bind(db.transactions);
db.transactions.update = ((id, changes) => {
  const localWrite = originalTransactionUpdate(id, changes);
  const transactionId = typeof id === "string" ? id : id.id;
  const softDelete = typeof changes === "object" && changes !== null && "is_deleted" in changes && changes.is_deleted === true;
  if (softDelete) {
    void localWrite.then(async () => {
      try {
        if (isOnline() && isSupabaseConfigured) await softDeleteRemoteTransaction(transactionId);
        else throw new Error("offline");
      } catch {
        await queueOperation({ entity: "transaction", action: "delete", payload: { id: transactionId }, created_at: Date.now() });
      }
    });
  }
  return localWrite;
}) as typeof db.transactions.update;

