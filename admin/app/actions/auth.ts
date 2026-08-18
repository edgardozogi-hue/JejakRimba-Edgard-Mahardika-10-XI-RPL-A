"use server";

import { getServerClient } from "@/lib/supabase-server";

export async function signOut(): Promise<void> {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
}

export async function login(email: string, password: string): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email atau kata sandi salah." };
  }

  if (!data.user) {
    return { error: "Login gagal." };
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "Akses ditolak. Hanya administrator." };
  }

  return { error: null };
}