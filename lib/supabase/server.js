import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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

