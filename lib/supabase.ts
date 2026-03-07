import { createClient } from "@supabase/supabase-js";

// 빌드 시 env 미설정으로 인한 "supabaseUrl is required" 오류 방지
// 실제 네트워크 호출은 클라이언트(useEffect)에서만 발생하므로 안전합니다.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
