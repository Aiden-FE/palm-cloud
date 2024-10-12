import { generateMD5 } from '@app/common';
import { MinioService } from '@app/minio';
import { MysqlService } from '@app/mysql';
import { RedisService } from '@app/redis';
import { Injectable, Logger } from '@nestjs/common';
import { writeFileSync } from 'node:fs';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly mysqlService: MysqlService,
    private readonly minioService: MinioService,
    private readonly redisService: RedisService,
  ) {}

  async mergeChunks(params: { taskId: string; ownerId: string }) {
    const key = `resources/upload/${params.ownerId}/${params.taskId}`;
    const chunkKeys = await this.redisService.client.keys(`${key}/*`);
    const chunks = [] as any[];
    const taskPromises = [] as Promise<any>[];
    chunkKeys
      .sort((a, b) => {
        const indexA = parseInt(a.split('/').pop() as string, 10);
        const indexB = parseInt(b.split('/').pop() as string, 10);
        return indexA - indexB;
      })
      .forEach((key) => {
        taskPromises.push(this.redisService.client.get(key).then((chunk) => chunks.push(Buffer.from(chunk!))));
      });
    await Promise.all(taskPromises);
    const mergedBuffer = Buffer.concat(chunks);
    const taskInfo = JSON.parse((await this.redisService.client.get(key)) || '');
    writeFileSync(`./tmp/${taskInfo.filename}`, mergedBuffer);
    await this.redisService.client.del(chunkKeys.concat(key));
    return {
      ...taskInfo,
      bufferLen: mergedBuffer.length,
    };
  }

  /** 临时保存分片 */
  async saveChunk(params: { taskId: string; chunkIndex: number; buffer: Buffer; ownerId: string }) {
    const key = `resources/upload/${params.ownerId}/${params.taskId}/${params.chunkIndex}`;
    await this.redisService.client.set(key, params.buffer.toString(), { PX: 1000 * 60 * 60 });
    return true;
  }

  /** 创建资源上传任务 */
  async createUploadTask(params: {
    filename: string;
    folderId?: number;
    ownerId: string;
    size: number;
    type: string;
    chunkStatus: (0 | 1)[];
  }) {
    const data = JSON.stringify(params);
    const taskId = generateMD5(data);
    const key = `resources/upload/${params.ownerId}/${taskId}`;
    const chunkStatus = [...params.chunkStatus];
    await this.redisService.client.set(key, data, { PX: 1000 * 60 * 60 });
    for (let i = 0; i < chunkStatus.length; i++) {
      const result = await this.redisService.client.exists(`${key}/${i}`);
      if (result) {
        chunkStatus[i] = 1;
      } else {
        chunkStatus[i] = 0;
      }
    }
    return {
      taskId,
      chunkStatus,
    };
  }

  /** 检查路径下是否已存在该文件 */
  async isResourceExistsInFolder(params: { filename: string; folderId?: number; ownerId: string }) {
    const [result] = await this.mysqlService.client.query(
      'SELECT * FROM resources WHERE name = ? AND folderId = ? AND ownerId = ?',
      [params.filename, params.folderId === undefined ? -1 : params.folderId, params.ownerId],
    );
    return !!result[0];
  }

  async getResourceById(uid: string, id: number) {
    const [result] = await this.mysqlService.client.query('SELECT * FROM resources WHERE id = ? AND ownerId = ?', [
      id,
      uid,
    ]);
    return result;
  }

  async getResourcesList(uid: string, folderId = -1) {
    const [result] = await this.mysqlService.client.query(
      'SELECT * FROM resources WHERE folderId = ? AND ownerId = ?',
      [folderId, uid],
    );
    const resp = [] as any[];
    for (const item of result as any[]) {
      const url = await this.minioService.client.presignedGetObject(item.bucketName, item.filePath, 60 * 60);
      resp.push({
        ...item,
        url,
      });
    }
    return resp;
  }
}
