import { generateMD5 } from '@app/common';
import { MinioService } from '@app/minio';
import { MysqlService } from '@app/mysql';
import { RedisService } from '@app/redis';
import { Injectable } from '@nestjs/common';
import { writeFileSync } from 'node:fs';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly mysqlService: MysqlService,
    private readonly minioService: MinioService,
    private readonly redisService: RedisService,
  ) {}

  async finishUploadResource(params: { filepath: string; ownerId: string; filename?: string; folderId?: number }) {
    const filePath = `resources/upload/${params.ownerId}/${params.filepath}`;
    const filename = params.filename || filePath.split('/').pop();
    const url = await this.minioService.client.presignedGetObject('palm-cloud', filePath, 60 * 60 * 1);
    const result = await this.minioService.client.statObject('palm-cloud', filePath);
    await this.mysqlService.client.query(
      'INSERT INTO resources (name, bucketName, filePath, fileType, fileSize, ownerId, folderId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        filename,
        'palm-cloud',
        filePath,
        result.metaData['content-type'],
        result.size,
        params.ownerId,
        params.folderId || -1,
      ],
    );
    return { ...result, url };
  }

  async generateUploadUrl(params: { filepath: string; ownerId: string }) {
    const filePath = `resources/upload/${params.ownerId}/${params.filepath}`;
    // 1 小时内有效
    return this.minioService.client.presignedPutObject('palm-cloud', filePath, 60 * 60 * 1);
  }

  async getFolders(params: { folderId?: number; ownerId: string }) {
    const [result] = await this.mysqlService.client.query(
      'SELECT * FROM resource_folders WHERE parentId = ? AND ownerId = ?',
      [params?.folderId || -1, params.ownerId],
    );
    return result;
  }

  async createFolder(params: { parentId?: number; ownerId: string; name: string }) {
    const [result] = await this.mysqlService.client.query(
      'INSERT INTO resource_folders(name, parentId, ownerId) VALUES(?, ?, ?)',
      [params.name, params.parentId || -1, params.ownerId],
    );
    return result;
  }

  async mergeChunks(params: { taskId: string; ownerId: string }) {
    const key = `resources/upload/${params.ownerId}/${params.taskId}`;
    const chunkKeys = await this.redisService.client.keys(`${key}/*`);
    const chunks = [] as any[]; // 分片列表
    const taskInfo = JSON.parse((await this.redisService.client.get(key)) || ''); // 任务信息
    // const bucketName = 'palm-cloud';
    // const bucketFilePath = `resources/upload/${params.ownerId}/${generateMD5(JSON.stringify({ taskId: params.taskId, ownerId: params.ownerId }))}-${taskInfo.filename}`;
    const taskPromises = [] as Promise<any>[];
    chunkKeys
      .sort((a, b) => {
        const indexA = parseInt(a.split('/').pop() as string, 10);
        const indexB = parseInt(b.split('/').pop() as string, 10);
        return indexA - indexB;
      })
      .forEach((key) => {
        taskPromises.push(this.redisService.client.get(key).then((chunk) => chunks.push(Buffer.from(chunk!, 'hex'))));
      });
    await Promise.all(taskPromises);
    const mergedBuffer = Buffer.concat(chunks);
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
    await this.redisService.client.set(key, params.buffer.toString('hex'), { PX: 1000 * 60 * 60 });
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

  async getResourcesList(uid: string, folderId = -1, fileType?: string) {
    let sql = 'SELECT * FROM resources WHERE folderId = ? AND ownerId = ?';
    const params = [folderId, uid];
    if (fileType) {
      if (fileType !== 'other') {
        sql += ' AND fileType LIKE ?';
        params.push(`%${fileType}%`);
      } else {
        sql += " AND fileType NOT LIKE '%video%' AND fileType NOT LIKE '%image%'";
      }
    }
    const [result] = await this.mysqlService.client.query(sql, params);
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
