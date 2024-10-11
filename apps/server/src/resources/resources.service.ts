import { generateMD5 } from '@app/common';
import { MinioService } from '@app/minio';
import { MysqlService } from '@app/mysql';
import { RedisService } from '@app/redis';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ResourcesService {
  constructor(
    private readonly mysqlService: MysqlService,
    private readonly minioService: MinioService,
    private readonly redisService: RedisService,
  ) {}

  /** 创建资源上传任务 */
  async createUploadTask(params: { filename: string; folderId?: number; ownerId: string; size: number; type: string }) {
    const data = JSON.stringify(params);
    const taskId = generateMD5(data);
    const key = `resources/upload/${params.ownerId}/${taskId}`;
    await this.redisService.client.set(key, data, { PX: 1000 * 60 * 60 });
    return taskId;
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
