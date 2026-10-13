const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim();
const API_URL = (configuredApiUrl || (import.meta.env.DEV ? "http://localhost:5000" : "")).replace(/\/+$/, "");

export async function api(path, options = {}) {
  if (!API_URL) {
    throw new Error(
      "Backend API URL is not configured."
    );
  }

  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    ["token", "isLoggedIn", "userName", "userEmail"].forEach((key) =>
      localStorage.removeItem(key)
    );
    window.location.assign("/");
  }

  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
