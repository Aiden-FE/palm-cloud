import { cloneDeep, get, merge } from 'lodash';
import { EnvironmentVariables } from '@app/common/interfaces';
import Ajv from 'ajv';
import { parse as dotenvParse } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Logger } from '@nestjs/common';

const ajv = new Ajv({
  removeAdditional: false, // 移除未定义属性
  useDefaults: true, // 使用默认值
  coerceTypes: true, // 类型转换
});

const schema = {
  type: 'object',
  properties: {
    NODE_ENV: {
      type: 'string',
      default: process.env.NODE_ENV || 'production',
    },
    APP_THROTTLE_TTL: {
      type: 'integer',
      default: 1000 * 60,
    },
    APP_THROTTLE_LIMIT: {
      type: 'integer',
      default: 60,
    },
    APP_PRIVATE_SECRET: { type: 'string' },
    APP_PUBLIC_SECRET: { type: 'string' },
    APP_SALT_SECRET: { type: 'string' },
    MYSQL_HOST: { type: 'string' },
    MYSQL_PORT: { type: 'integer' },
    MYSQL_USER: { type: 'string' },
    MYSQL_PASSWORD: { type: 'string' },
    MYSQL_DATABASE: { type: 'string' },
    REDIS_CONNECTION_URL: { type: 'string' },
    EMAIL_HOST: { type: 'string' },
    EMAIL_PORT: { type: 'number' },
    EMAIL_USER: { type: 'string' },
    EMAIL_PASSWORD: { type: 'string' },
    EMAIL_FROM: { type: 'string' },
    APP_JWT_EXPIRES: {
      type: 'string',
      default: '14d',
    },
  },
};

const validateEnv = ajv.compile(schema);
let isInit = false;
let config: EnvironmentVariables;

function initEnvConfig() {
  if (isInit) {
    return;
  }

  let data: any = {};
  try {
    data = dotenvParse(readFileSync(process.env.ENV_FILE_PATH || join(process.cwd(), '.env')));
  } catch (e) {
    Logger.warn('配置文件读取异常,使用默认值设置环境变量', e);
  }

  const valid = validateEnv(data);
  if (!valid) {
    Logger.error(`配置数据验证失败,请检查是否符合Schema要求: ${schema}`);
    return;
  }

  config = merge({}, process.env, data);
  isInit = true;
}

// 获取环境变量
export function getEnvConfig<Key extends keyof EnvironmentVariables, DefaultValue = unknown>(
  key: Key,
  defaultValue: DefaultValue,
): EnvironmentVariables[Key] | DefaultValue;
export function getEnvConfig<Key extends keyof EnvironmentVariables>(key: Key): EnvironmentVariables[Key];
export function getEnvConfig(): EnvironmentVariables;
export function getEnvConfig<Key extends keyof EnvironmentVariables, DefaultValue = unknown>(
  key?: Key,
  defaultValue?: DefaultValue,
): EnvironmentVariables | EnvironmentVariables[Key] | DefaultValue {
  if (!isInit) {
    initEnvConfig();
  }
  // @ts-ignore
  return key ? get(config, key, defaultValue) : cloneDeep(config);
}
