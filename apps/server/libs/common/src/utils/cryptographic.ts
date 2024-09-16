import * as crypto from 'node:crypto';
import { getEnvConfig } from '@app/common';
import { importESM } from './common';

/** 生成不可逆数据 */
export function generateSHA256(data: string) {
  return crypto
    .createHash('sha256')
    .update(`${data}_${getEnvConfig('APP_THROTTLE_LIMIT')}`)
    .digest('hex');
}

/**
 * 生成uuid
 * @param [size=36]
 */
export async function generateUUID(size?: number): Promise<string> {
  const { nanoid } = await importESM('nanoid');
  return nanoid(size);
}

/** 加密数据 */
export function encryptData(data: string) {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(getEnvConfig('APP_PUBLIC_SECRET'), buffer);
  return encrypted;
}

/** 解密数据 */
export function decryptData(encryptedData: string) {
  const buffer = Buffer.from(encryptedData, 'base64');
  const decrypted = crypto.privateDecrypt(getEnvConfig('APP_PRIVATE_SECRET'), buffer);
  return decrypted.toString('utf8');
}
