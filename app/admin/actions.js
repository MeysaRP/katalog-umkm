"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const isDirectFormAction = prevState instanceof FormData;

  const email = data?.get?.("email")?.toString().trim();
  const password = data?.get?.("password")?.toString();

  if (!email || !password) {
    const errorMsg = "Email dan password wajib diisi.";
    if (isDirectFormAction) {
      redirect("/admin/login?error=" + encodeURIComponent(errorMsg));
    }
    return { error: errorMsg };
  }

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const errorMsg =
      error.code === "invalid_credentials" || error.message === "Invalid login credentials"
        ? "Email atau password salah."
        : error.message || "Gagal masuk. Silakan coba lagi.";

    if (isDirectFormAction) {
      redirect("/admin/login?error=" + encodeURIComponent(errorMsg));
    }
    return { error: errorMsg };
  }

  redirect("/admin");
}

export async function keluar() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;

  const passwordBaru = data?.get?.("password_baru")?.toString();
  const konfirmasiPassword = data?.get?.("konfirmasi_password")?.toString();

  if (!passwordBaru || passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Konfirmasi password tidak sama dengan password baru." };
  }

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Anda harus masuk terlebih dahulu untuk mengganti password." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return {
      error: error.message || "Gagal mengganti password. Silakan coba lagi.",
    };
  }

  return { success: true, message: "Password berhasil diganti." };
}
