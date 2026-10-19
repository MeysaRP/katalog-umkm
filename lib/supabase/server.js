import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getCleanSupabaseUrl(rawUrl) {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    return parsed.origin;
  } catch {
    return rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  }
}

/**
 * Koneksi Supabase untuk server memakai SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik di server (seperti katalog dan detail produk).
 */
export function createClient() {
  const rawUrl = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!rawUrl || !secretKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable."
    );
  }

  const supabaseUrl = getCleanSupabaseUrl(rawUrl);

  return createSupabaseClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createServerClient = createClient;

/**
 * Koneksi sesi admin menggunakan SUPABASE_PUBLISHABLE_KEY dan cookie (@supabase/ssr).
 * Digunakan untuk autentikasi (login, logout, ganti password) dan aksi kelola produk.
 */
export async function createSessionClient() {
  const cookieStore = await cookies();
  const rawUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!rawUrl || !publishableKey) {
    throw new Error(
      "SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable."
    );
  }

  const supabaseUrl = getCleanSupabaseUrl(rawUrl);

  return createSupabaseServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Dipanggil dari konteks yang tidak mengizinkan penulisan cookie (misal Server Component)
        }
      },
    },
  });
}

export const createAdminClient = createSessionClient;
