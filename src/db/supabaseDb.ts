import { supabase } from "@/lib/supabase";
import type { Category, Transaction } from "@/db/localDb";

export async function ensureSupabaseUser() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user) return sessionData.session.user;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.user) throw new Error("Supabase tidak mengembalikan user anonim.");
  return data.user;
}

export async function getRemoteCategories(type?: Category["type"]) {
  try {
    await ensureSupabaseUser();
    let query = supabase.from("categories").select("*").eq("is_deleted", false).order("name");
    if (type) query = query.eq("type", type);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Category[];
  } catch (error) {
    console.warn("Supabase belum siap mengambil kategori:", error);
    return [];
  }
}

export async function getRemoteTransactions() {
  try {
    await ensureSupabaseUser();
    const { data, error } = await supabase.from("transactions").select("*").eq("is_deleted", false).order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map((transaction) => ({
      ...transaction,
      date: new Date(transaction.date).getTime(),
      created_at: new Date(transaction.created_at).getTime(),
      updated_at: new Date(transaction.updated_at).getTime(),
    })) as Transaction[];
  } catch (error) {
    console.warn("Supabase belum siap mengambil transaksi:", error);
    return [];
  }
}

export async function createRemoteCategory(category: Omit<Category, "created_at" | "updated_at">) {
  const user = await ensureSupabaseUser();
  const { error } = await supabase.from("categories").insert({ ...category, user_id: user.id });
  if (error) throw error;
}

export async function createRemoteTransaction(transaction: Omit<Transaction, "created_at" | "updated_at">) {
  const user = await ensureSupabaseUser();
  const { error } = await supabase.from("transactions").insert({
    ...transaction,
    user_id: user.id,
    date: new Date(transaction.date).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function softDeleteRemoteTransaction(id: string) {
  await ensureSupabaseUser();
  const { error } = await supabase.from("transactions").update({ is_deleted: true, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
