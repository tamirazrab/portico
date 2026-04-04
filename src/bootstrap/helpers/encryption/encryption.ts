import Cryptr from "cryptr";

function getCryptr(): Cryptr {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "ENCRYPTION_KEY environment variable is required for credential encryption",
    );
  }
  return new Cryptr(key);
}

export function encrypt(value: string): string {
  return getCryptr().encrypt(value);
}

/**
 * Decrypts a stored secret. Never log, serialize to clients, or interpolate into URLs that
 * may appear in logs; use only in memory for outbound API calls.
 */
export function decrypt(encryptedValue: string): string {
  return getCryptr().decrypt(encryptedValue);
}
