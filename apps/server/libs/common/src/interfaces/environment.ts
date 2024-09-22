export interface EnvironmentVariablesDto {
  /**
   * 环境变量
   * @default process.env.NODE_ENV | 'production'
   */
  NODE_ENV?: 'development' | 'production';
  /**
   * API节流间隔 毫秒单位
   * @default 60000
   */
  APP_THROTTLE_TTL?: number;
  /**
   * 节流间隔内的限制次数
   * @default 60
   */
  APP_THROTTLE_LIMIT?: number;
  /**
   * 应用隐私数据密钥 请通过`pnpm generate:key`来获取公私钥
   */
  APP_PRIVATE_SECRET: string;
  APP_PUBLIC_SECRET: string;
  APP_SALT_SECRET: string;
  APP_JWT_EXPIRES?: string;

  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_USER: string;
  MYSQL_PASSWORD: string;
  MYSQL_DATABASE: string;

  REDIS_CONNECTION_URL: string;

  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;

  MINIO_ENDPOINT: string;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  MINIO_PORT?: number;
  MINIO_USE_SSL?: boolean;
}

// 与默认值合并后的环境变量声明
export type EnvironmentVariables = EnvironmentVariablesDto &
  Required<
    Pick<EnvironmentVariablesDto, 'NODE_ENV' | 'APP_THROTTLE_TTL' | 'APP_THROTTLE_LIMIT' | 'APP_PRIVATE_SECRET'>
  >;
