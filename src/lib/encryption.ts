// AES-256-GCM envelope encryption for API keys.
//
// ENVELOPE SCHEME:
//   1. Generate a random 32-byte Data Encryption Key (DEK) per key-save operation.
//   2. Encrypt the plaintext API key with the DEK using AES-256-GCM → (iv, authTag, ciphertext).
//   3. Encrypt the DEK with the master key (ENCRYPTION_MASTER_KEY) using AES-256-GCM → (iv2, authTag2, encDEK).
//   4. Store as: "iv:authTag:iv2:authTag2:encDEK:ciphertext" — all hex, colon-delimited.
//
// DECRYPTION (only server-side, never sent to client):
//   1. Parse the stored string.
//   2. Decrypt encDEK with master key → DEK.
//   3. Decrypt ciphertext with DEK → plaintext.
//
// This means compromising any single key in storage does not expose others,
// and rotating the master key only requires re-encrypting the DEK layer.

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32; // 256-bit
const IV_BYTES = 12;  // 96-bit IV is recommended for GCM

// ─── Master key loading ───────────────────────────────────────────────────────

/**
 * Loads and validates the master encryption key from env.
 * Throws at call time (not module load time) to allow Next.js to start
 * without the key set during local dev — but every actual encrypt/decrypt
 * call will fail clearly if it's missing.
 */
function getMasterKey(): Buffer {
  const raw = process.env.ENCRYPTION_MASTER_KEY;
  if (!raw) {
    throw new Error(
      "[encryption] ENCRYPTION_MASTER_KEY is not set. " +
        "Generate one with: openssl rand -hex 32"
    );
  }
  const buf = Buffer.from(raw, "hex");
  if (buf.length !== KEY_BYTES) {
    throw new Error(
      `[encryption] ENCRYPTION_MASTER_KEY must be exactly ${KEY_BYTES * 2} hex characters (${KEY_BYTES} bytes).`
    );
  }
  return buf;
}

// ─── AES-256-GCM helpers ──────────────────────────────────────────────────────

interface EncryptResult {
  iv: string;      // hex
  authTag: string; // hex
  ciphertext: string; // hex
}

function encryptWithKey(plaintext: Buffer, key: Buffer): EncryptResult {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext: encrypted.toString("hex"),
  };
}

function decryptWithKey(
  ciphertextHex: string,
  ivHex: string,
  authTagHex: string,
  key: Buffer
): Buffer {
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ]);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Encrypts a plaintext API key using envelope encryption.
 * Returns a single colon-delimited string safe to store in the DB.
 * NEVER logs or returns the plaintext.
 */
export function encryptApiKey(plaintext: string): string {
  const masterKey = getMasterKey();

  // Generate a unique DEK for this key
  const dek = randomBytes(KEY_BYTES);

  // Encrypt the plaintext with the DEK
  const { iv, authTag, ciphertext } = encryptWithKey(Buffer.from(plaintext, "utf8"), dek);

  // Encrypt the DEK with the master key
  const {
    iv: iv2,
    authTag: authTag2,
    ciphertext: encDek,
  } = encryptWithKey(dek, masterKey);

  // Format: iv:authTag:iv2:authTag2:encDek:ciphertext
  return [iv, authTag, iv2, authTag2, encDek, ciphertext].join(":");
}

/**
 * Decrypts an envelope-encrypted API key.
 * Only call server-side. Never send the decrypted value to the client.
 */
export function decryptApiKey(stored: string): string {
  const masterKey = getMasterKey();

  const parts = stored.split(":");
  if (parts.length !== 6) {
    throw new Error("[encryption] Stored value is in an unexpected format.");
  }

  const [iv, authTag, iv2, authTag2, encDek, ciphertext] = parts;

  // Decrypt the DEK
  const dek = decryptWithKey(encDek, iv2, authTag2, masterKey);

  // Decrypt the plaintext
  const plaintext = decryptWithKey(ciphertext, iv, authTag, dek);

  return plaintext.toString("utf8");
}
