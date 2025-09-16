// lib/crypto.js
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // expected hex or base64
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY must be set as env var (32 bytes)');
}

// convert key to Buffer; support hex or base64
let KEY;
if (/^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY) && ENCRYPTION_KEY.length === 64) {
  KEY = Buffer.from(ENCRYPTION_KEY, 'hex');
} else {
  KEY = Buffer.from(ENCRYPTION_KEY, 'base64');
}
if (KEY.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes (256 bits)');

export function encrypt(text) {
  const iv = crypto.randomBytes(12); // 12 bytes for AES-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // return base64 string containing iv:tag:ciphertext
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decrypt(payload) {
  const [ivB64, tagB64, encB64] = payload.split(':');
  if (!ivB64 || !tagB64 || !encB64) throw new Error('Invalid encrypted payload format');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(encB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
