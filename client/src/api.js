const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// One helper for every request: adds the login token and handles errors.
export async function api(path, options = {}) {
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

  // Expired or missing login: clear it and go back to the landing page
  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    localStorage.clear();
    window.location.assign("/");
  }

  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}