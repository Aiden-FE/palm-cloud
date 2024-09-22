import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createConnection } from 'mysql2/promise';
import { Logger } from '@nestjs/common';
import { getEnvConfig } from '@app/common';
import * as MinIO from 'minio';
import { getCliParam } from '@compass-aiden/helpers/dist/node.cjs';

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

function getMinIOClient() {
  return new MinIO.Client({
    endPoint: getEnvConfig('MINIO_ENDPOINT'),
    port: getEnvConfig('MINIO_PORT'),
    accessKey: getEnvConfig('MINIO_ACCESS_KEY'),
    secretKey: getEnvConfig('MINIO_SECRET_KEY'),
    useSSL: getEnvConfig('MINIO_USE_SSL'),
  });
}

function getAllObjects(client: MinIO.Client, fromBucketName: string, fromPath = '/', ownerId = '') {
  return new Promise((resolve, reject) => {
    const result = [] as any;
    client
      .listObjectsV2(fromBucketName, fromPath, true)
      .on('data', (obj) => {
        result.push(obj);
      })
      .on('error', (err) => {
        reject(err);
      })
      .on('end', () => {
        const promises = result.map(async (obj) => {
          const objInfo = await client.statObject(fromBucketName, obj.name as string);
          const data = {
            name: obj.name.split('/').pop(),
            bucketName: fromBucketName,
            filePath: obj.name,
            fileType: objInfo.metaData['content-type'],
            fileSize: obj.size,
            ownerId,
          };
          return data;
        });
        resolve(Promise.all(promises));
      });
  });
}

// pnpm syncoss --from bucketname --from-path / --ownerId idstr
async function main() {
  const connection = await getConnection();
  const minIOClient = getMinIOClient();
  const fromBucketName = (getCliParam('--from') as string) || '';
  const fromPath = (getCliParam('--from-path') as string) || '/';
  const ownerId = (getCliParam('--ownerId') as string) || '';
  const result = await getAllObjects(minIOClient, fromBucketName, fromPath, ownerId);
  try {
    await connection.beginTransaction();
    const promiseAll = (result as any).map(async (item) => {
      return connection.query(
        'INSERT INTO resources (name, bucketName, filePath, fileType, fileSize, ownerId) VALUES (?, ?, ?, ?, ?, ?)',
        [item.name, item.bucketName, item.filePath, item.fileType, item.fileSize, item.ownerId],
      );
    });
    await Promise.all(promiseAll);
    // await connection.execute(sql, [insertData]);
    await connection.commit();
  } catch (e) {
    await connection.rollback();
    Logger.warn('发生错误,已回滚事务');
    throw e;
  }
  await connection.end();
}

main();
