// CLIENT_URL can contain multiple CORS origins; an email needs one destination.
export function getResetClientUrl(env = process.env) {
  const configuredUrl = env.PASSWORD_RESET_URL || env.CLIENT_URL || "";
  const firstUrl = configuredUrl.split(",")[0].trim().replace(/^["']|["']$/g, "");
  try {
    const url = new URL(firstUrl);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}