const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch(url: string, options: RequestInit) {
  const res = await fetch(`${API_URL}${url}`, { ...options, credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API Error");
  return data;
}

export async function registerUser(data: {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: "owner" | "renter";
}) {
  return apiFetch("/api/user/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: { email: string; password: string; rememberMe?: boolean }) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function logoutUser() {
  return apiFetch("/api/auth/logout", { 
    method: "POST",
    credentials: "include",
 });
}

export async function forgotPassword(email: string) {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(data: { email: string; otp: string; password: string }) {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
