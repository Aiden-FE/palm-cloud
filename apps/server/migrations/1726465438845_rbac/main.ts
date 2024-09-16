import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createConnection } from 'mysql2/promise';
import { Logger } from '@nestjs/common';
import { getEnvConfig } from '@app/common';

function getConnection() {
  return createConnection({
    host: getEnvConfig('MYSQL_HOST'),
    port: getEnvConfig('MYSQL_PORT'),
    user: getEnvConfig('MYSQL_USER'),
    password: getEnvConfig('MYSQL_PASSWORD'),
    database: getEnvConfig('MYSQL_DATABASE'),
    multipleStatements: true, // 允许多语句,以便读取sql文件执行
  });
}

export async function main(): Promise<1 | -1> {
  const connection = await getConnection();
  const [result] = await connection.query(`SELECT id, name FROM migrations WHERE name = 'rbac' LIMIT 1`);

  if (result[0]) {
    await connection.end();
    Logger.log(`已执行过 rbac 的迁移任务`);
    return -1;
  } else {
    await connection.query(readFileSync(join(__dirname, './main.sql'), { encoding: 'utf-8' }));
    await connection.query(`INSERT INTO migrations (name) VALUES ('rbac')`);
    await connection.end();
    Logger.log(`rbac 的迁移任务执行完成`);
    return 1;
  }
}

export async function rollback(): Promise<1 | -1> {
  const connection = await getConnection();
  const [result] = await connection.query(`SELECT id, name FROM migrations WHERE name = 'rbac' LIMIT 1`);

  if (result[0]) {
    await connection.query(readFileSync(join(__dirname, './rollback.sql'), { encoding: 'utf-8' }));
    await connection.query("DELETE FROM migrations WHERE `name` = 'rbac'");
    await connection.end();
    Logger.log(`rbac 的回滚任务执行完成`);
    return 1;
  } else {
    await connection.end();
    Logger.log(`rbac 的迁移任务已回滚或不存在`);
    return -1;
  }
}
