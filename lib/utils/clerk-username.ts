export function splitFullName(fullName = "") {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") ?? "",
  };
}

/** Derive a Clerk-safe username from an email address. */
export function makeClerkUsername(email: string, suffix = 0) {
  const local = email.split("@")[0] ?? "";
  let base = local.replace(/[^a-zA-Z]/g, "").toLowerCase();
  if (base.length < 4) base = (base + "user").slice(0, 32);
  base = base.slice(0, suffix > 0 ? 29 : 32);
  return suffix > 0 ? `${base}${suffix}` : base;
}
