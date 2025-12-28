import Cryptr from "cryptr";

const cryptr = new Cryptr(
  process.env.ENCRYPTION_KEY || "default-key-change-in-production",
);

export function encrypt(value: string): string {
  return cryptr.encrypt(value);
}

export function decrypt(encryptedValue: string): string {
  return cryptr.decrypt(encryptedValue);
}
