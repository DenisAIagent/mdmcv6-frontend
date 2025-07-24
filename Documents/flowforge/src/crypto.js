import crypto from 'crypto';
import { config } from './config.js';

const ALGORITHM = 'aes-256-gcm';

export function encrypt(text) {
  if (!config.encryptionKey) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const key = Buffer.from(config.encryptionKey, 'base64');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, key);
  
  cipher.setAAD(Buffer.from('flowforge-auth'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedData) {
  if (!config.encryptionKey) {
    throw new Error('ENCRYPTION_KEY not configured');
  }

  const key = Buffer.from(config.encryptionKey, 'base64');
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipher(ALGORITHM, key);
  decipher.setAAD(Buffer.from('flowforge-auth'));
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(32);
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  return salt.toString('hex') + ':' + hash.toString('hex');
}

export function verifyPassword(password, hashedPassword) {
  const parts = hashedPassword.split(':');
  const salt = Buffer.from(parts[0], 'hex');
  const hash = Buffer.from(parts[1], 'hex');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  return crypto.timingSafeEqual(hash, verifyHash);
}