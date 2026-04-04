import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;

  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fe80:")) return true; // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique-local
  return false;
}

function isLocalHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h === "0.0.0.0"
  );
}

export type ValidateOutboundUrlResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

export async function validateOutboundUrl(
  input: string,
): Promise<ValidateOutboundUrlResult> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, reason: "Invalid URL" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "Only http/https URLs are allowed" };
  }

  if (isLocalHostname(url.hostname)) {
    return { ok: false, reason: "Localhost URLs are not allowed" };
  }

  const ipType = isIP(url.hostname);
  if (ipType === 4 && isPrivateIpv4(url.hostname)) {
    return { ok: false, reason: "Private network URLs are not allowed" };
  }
  if (ipType === 6 && isPrivateIpv6(url.hostname)) {
    return { ok: false, reason: "Private network URLs are not allowed" };
  }

  // If hostname is not a literal IP, resolve and block private targets.
  if (ipType === 0) {
    try {
      const resolved = await lookup(url.hostname, {
        all: true,
        verbatim: true,
      });
      for (const r of resolved) {
        if (r.family === 4 && isPrivateIpv4(r.address)) {
          return { ok: false, reason: "DNS resolved to private IPv4" };
        }
        if (r.family === 6 && isPrivateIpv6(r.address)) {
          return { ok: false, reason: "DNS resolved to private IPv6" };
        }
      }
    } catch {
      return { ok: false, reason: "Unable to resolve hostname" };
    }
  }

  return { ok: true, url };
}
