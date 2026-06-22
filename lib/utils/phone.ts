/** Strip non-digits and cap at 10 digits (Indian mobile). */
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

/** Digits only — use for tel:/wa.me links. */
export function phoneDigits(value?: string | null): string {
  return value?.replace(/\D/g, "") ?? "";
}

function spacedDigits(digits: string): string {
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 5) {
    parts.push(digits.slice(i, i + 5));
  }
  return parts.join(" ");
}

/** Format phone for display with 5-digit groups (e.g. "98765 43210"). */
export function formatPhone(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed;

  if (trimmed.startsWith("+") && digits.length > 10) {
    const cc = digits.slice(0, -10);
    return `+${cc} ${spacedDigits(digits.slice(-10))}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${spacedDigits(digits.slice(2))}`;
  }

  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return spacedDigits(local);
}
