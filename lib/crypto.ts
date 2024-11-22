import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-min-32-chars';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

export function encryptData(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Create key using PBKDF2
  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha256');

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the data
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  // Get auth tag
  const tag = cipher.getAuthTag();

  // Combine everything into a single string
  // Format: salt:iv:tag:encryptedData
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

export function decryptData(encryptedData: string): string {
  // Convert from base64 and split into components
  const buffer = Buffer.from(encryptedData, 'base64');

  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const content = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  // Create key using PBKDF2
  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, 'sha256');

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  // Decrypt the data
  const decrypted = Buffer.concat([
    decipher.update(content),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
