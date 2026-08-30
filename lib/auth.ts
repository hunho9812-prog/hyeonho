export const AUTH_COOKIE = "hyeonho_auth";

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// SITE_PASSWORD 미설정 시 null → 미들웨어가 게이트를 통과시킴 (로컬 개발 편의)
export async function getExpectedToken(): Promise<string | null> {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null;
  return sha256Hex(password);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const correct = process.env.SITE_PASSWORD;
  return !!correct && password === correct;
}
