"use server";

import { revalidatePath } from "next/cache";
import { getServerClient, getServiceClient } from "../lib/supabase-server";

export type NotificationPrefs = {
  booking: boolean;
  reminder: boolean;
  promo: boolean;
};

export type ProfileWithPrefs = {
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    role: "renter" | "vendor" | "admin" | null;
    notification_prefs: NotificationPrefs;
    created_at: string;
    updated_at: string;
  } | null;
  vendor: {
    id: string;
    business_name: string | null;
    description: string | null;
    whatsapp_number: string | null;
    address: string | null;
    city: string | null;
    lat: number | null;
    lng: number | null;
    is_active: boolean;
  } | null;
  error: string | null;
};

export async function getProfileWithPrefs(): Promise<ProfileWithPrefs> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, vendor: null, error: "Not authenticated" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, phone, role, notification_prefs, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return {
      user: {
        id: user.id,
        email: user.email ?? "",
        user_metadata: {
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
        },
      },
      profile: null,
      vendor: null,
      error: profileError.message,
    };
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name, description, whatsapp_number, address, city, lat, lng, is_active")
    .eq("profile_id", user.id)
    .maybeSingle();

  const prefs = (profile?.notification_prefs as NotificationPrefs) ?? {
    booking: true,
    reminder: true,
    promo: false,
  };

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      user_metadata: {
        full_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
      },
    },
    profile: {
      id: profile!.id,
      full_name: profile!.full_name,
      avatar_url: profile!.avatar_url,
      phone: profile!.phone,
      role: profile!.role as "renter" | "vendor" | "admin" | null,
      notification_prefs: prefs,
      created_at: profile!.created_at,
      updated_at: profile!.updated_at,
    },
    vendor,
    error: null,
  };
}

export async function updateProfile(data: {
  full_name?: string;
  avatar_url?: string;
}): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const updates: Record<string, string> = {};
  if (data.full_name !== undefined) updates.full_name = data.full_name;
  if (data.avatar_url !== undefined) updates.avatar_url = data.avatar_url;

  if (Object.keys(updates).length === 0) {
    return { error: "No data to update" };
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return { error: "Gagal memperbarui profil: " + error.message };
  }

  // Also update auth user_metadata for avatar
  if (data.avatar_url !== undefined) {
    await supabase.auth.updateUser({
      data: { avatar_url: data.avatar_url },
    });
  }

  revalidatePath("/profil");
  revalidatePath("/profil/pengaturan");

  return { error: null };
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Not authenticated" };
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Kata sandi saat ini salah." };
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: "Gagal mengubah kata sandi: " + error.message };
  }

  // Update password_changed_at timestamp
  await supabase
    .from("profiles")
    .update({ password_changed_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/profil/pengaturan");

  return { error: null };
}

export async function updateNotificationPrefs(
  prefs: NotificationPrefs
): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ notification_prefs: prefs })
    .eq("id", user.id);

  if (error) {
    return { error: "Gagal menyimpan preferensi: " + error.message };
  }

  revalidatePath("/profil/pengaturan");

  return { error: null };
}

export async function switchToRenter(
  password: string
): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Not authenticated" };
  }

  // Hanya akun vendor yang boleh beralih ke penyewa.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "vendor") {
    return { error: "Hanya akun vendor yang bisa beralih ke penyewa." };
  }

  // Verifikasi password sebagai langkah pengaman.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    return { error: "Kata sandi salah." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "renter" })
    .eq("id", user.id);

  if (error) {
    return { error: "Gagal mengubah peran: " + error.message };
  }

  revalidatePath("/profil/pengaturan");
  revalidatePath("/profil");
  revalidatePath("/booking");

  return { error: null };
}

export async function switchToVendor(
  password: string
): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Not authenticated" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "vendor") {
    return { error: "Sudah dalam mode penyedia." };
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!vendor) {
    return { error: "Belum terdaftar sebagai penyedia. Gunakan 'Daftar sebagai Penyedia'." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    return { error: "Kata sandi salah." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "vendor" })
    .eq("id", user.id);

  if (error) {
    return { error: "Gagal mengubah peran: " + error.message };
  }

  revalidatePath("/profil/pengaturan");
  revalidatePath("/profil");
  revalidatePath("/penyedia");

  return { error: null };
}

export async function registerAsVendor(
  data: {
    business_name: string;
    description: string;
    whatsapp_number: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
  },
  password: string
): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Not authenticated" };
  }

  const { data: existingVendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existingVendor) {
    return { error: "Sudah terdaftar sebagai penyedia." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    return { error: "Kata sandi salah." };
  }

  const { error: vendorError } = await supabase.from("vendors").insert({
    profile_id: user.id,
    business_name: data.business_name,
    description: data.description,
    whatsapp_number: data.whatsapp_number,
    address: data.address,
    city: data.city,
    lat: data.lat,
    lng: data.lng,
    is_active: true,
  });

  if (vendorError) {
    return { error: "Gagal mendaftarkan penyedia: " + vendorError.message };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "vendor" })
    .eq("id", user.id);

  if (error) {
    await supabase.from("vendors").delete().eq("profile_id", user.id);
    return { error: "Gagal mengubah peran: " + error.message };
  }

  revalidatePath("/profil/pengaturan");
  revalidatePath("/profil");
  revalidatePath("/penyedia");

  return { error: null };
}

export async function revokeAllSessions(): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Need the current access token to sign out all sessions via the admin API.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token ?? user.id;

  const serviceClient = getServiceClient();
  const { error } = await serviceClient.auth.admin.signOut(token, "global");

  if (error) {
    return { error: "Gagal mencabut sesi: " + error.message };
  }

  revalidatePath("/profil/pengaturan");

  return { error: null };
}

export async function softDeleteAccount(email: string): Promise<{ error: string | null }> {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== email) {
    return { error: "Email tidak cocok." };
  }

  // Soft delete: set deleted_at timestamp
  const { error } = await supabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { error: "Gagal menghapus akun: " + error.message };
  }

  // Also revoke all sessions
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? user.id;

  const serviceClient = getServiceClient();
  await serviceClient.auth.admin.signOut(token, "global");

  return { error: null };
}