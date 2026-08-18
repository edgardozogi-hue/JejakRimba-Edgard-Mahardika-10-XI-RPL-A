"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerClient, getServiceClient } from "../lib/supabase-server";
import { ROLE_TO_DB } from "../lib/database.types";

// ── Complete Registration (service role, bypass RLS) ──
// Dipanggil dari client SETELAH signUp berhasil. Karena user baru belum punya
// session (email confirmation wajib), insert profile/vendor lewat anon client
// ditolak RLS. Di sini kita pakai service role key sehingga insert aman.

export type CompleteRegistrationInput = {
  userId: string;
  fullName: string;
  phone: string;
  role: "penyewa" | "vendor";
  vendor_data?: {
    business_name: string;
    business_description?: string;
    whatsapp_number: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
};

export async function completeRegistration(
  input: CompleteRegistrationInput
): Promise<{ error: string | null }> {
  const supabase = getServiceClient();

  const { error: profileError } = await supabase.from("profiles").insert({
    id: input.userId,
    full_name: input.fullName,
    phone: input.phone,
    role: ROLE_TO_DB[input.role],
  });
  if (profileError) {
    return { error: "Gagal menyimpan profil: " + profileError.message };
  }

  if (input.role === "vendor" && input.vendor_data) {
    const { error: vendorError } = await supabase.from("vendors").insert({
      profile_id: input.userId,
      business_name: input.vendor_data.business_name,
      description: input.vendor_data.business_description ?? null,
      whatsapp_number: input.vendor_data.whatsapp_number,
      address: input.vendor_data.address,
      city: input.vendor_data.city || "Malang",
      lat: input.vendor_data.lat,
      lng: input.vendor_data.lng,
      is_active: true,
    });
    if (vendorError) {
      return { error: "Gagal menyimpan data usaha: " + vendorError.message };
    }
  }

  revalidatePath("/");
  return { error: null };
}

// ── Sign Up ──

export type SignUpResult = {
  error: string | null;
  user: { id: string; email: string } | null;
};

export async function signUp(formData: {
  email: string;
  password: string;
  full_name: string;
  phone_number: string;
  role: "penyewa" | "vendor";
  vendor_data?: {
    business_name: string;
    business_description?: string;
    whatsapp_number: string;
    address: string;
  };
}): Promise<SignUpResult> {
  const supabase = await getServerClient();

  // 1. Daftar ke auth.users
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.full_name,
        role: formData.role,
      },
    },
  });

  if (signUpError || !authData.user) {
    return { error: signUpError?.message ?? "Gagal membuat akun.", user: null };
  }

  // 2. Insert ke profiles
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    full_name: formData.full_name,
    phone: formData.phone_number,
    role: ROLE_TO_DB[formData.role],
  });

  if (profileError) {
    return {
      error: "Akun dibuat, tapi gagal menyimpan profil: " + profileError.message,
      user: null,
    };
  }

  // 3. Kalau vendor, insert ke vendors
  if (formData.role === "vendor" && formData.vendor_data) {
    const { error: vendorError } = await supabase.from("vendors").insert({
      profile_id: authData.user.id,
      business_name: formData.vendor_data.business_name,
      description: formData.vendor_data.business_description ?? null,
      whatsapp_number: formData.vendor_data.whatsapp_number,
      address: formData.vendor_data.address,
      city: "Malang",
      lat: -7.9666,
      lng: 112.6326,
      is_active: true,
    });

    if (vendorError) {
      return {
        error: "Profil dibuat, tapi gagal menyimpan data usaha: " + vendorError.message,
        user: null,
      };
    }
  }

  revalidatePath("/");
  return { error: null, user: { id: authData.user.id, email: authData.user.email! } };
}

// ── Sign In ──

export type SignInResult = {
  error: string | null;
};

export async function signIn(formData: {
  email: string;
  password: string;
}): Promise<SignInResult> {
  const supabase = await getServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  revalidatePath("/");
  return { error: null };
}

// ── Sign Out ──

export async function signOut(): Promise<void> {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

// ── Get Current User ──

export type CurrentUser = {
  id: string;
  email: string;
  profile: {
    full_name: string;
    phone: string | null;
    role: "penyewa" | "vendor" | "admin";
    avatar_url: string | null;
  } | null;
};

export async function getCurrentUser(): Promise<{
  user: CurrentUser | null;
  error: string | null;
}> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: null };
  }

  // Ambil profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, role, avatar_url")
    .eq("id", user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      profile,
    },
    error: null,
  };
}

// ── Reset Password ──

export async function resetPassword(email: string): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/lupa-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// ── Google OAuth Sign In ──

export async function signInWithGoogle(): Promise<void> {
  const supabase = await getServerClient();

  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }
}

// ── Get Profile Overview (role-aware) ──
// Dipakai halaman /profil. Mengembalikan profil + info bisnis vendor (kalau ada)
// agar UI bisa menampilkan tampilan penyewa vs vendor dan toggle role aktif.

export type ProfileOverview = {
  user: { id: string; email: string; full_name: string | null } | null;
  profileRole: "renter" | "vendor" | null;
  vendor: {
    id: string;
    business_name: string | null;
    description: string | null;
    address: string | null;
    city: string | null;
    whatsapp_number: string | null;
  } | null;
  error: string | null;
};

export async function getProfileOverview(): Promise<ProfileOverview> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, profileRole: null, vendor: null, error: null };
  }

  let profileRole: "renter" | "vendor" | null = null;
  let vendor: ProfileOverview["vendor"] = null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  profileRole = (profile?.role as "renter" | "vendor" | null) ?? null;

  const { data: v } = await supabase
    .from("vendors")
    .select("id, business_name, description, address, city, whatsapp_number")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (v) {
    vendor = {
      id: v.id,
      business_name: v.business_name,
      description: v.description,
      address: v.address,
      city: v.city,
      whatsapp_number: v.whatsapp_number,
    };
  }

  return { user: { id: user.id, email: user.email ?? "", full_name: profile?.full_name ?? null }, profileRole, vendor, error: null };
}
