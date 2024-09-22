import { MinioService } from '@app/minio';
import { MysqlService } from '@app/mysql';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ResourcesService {
  constructor(private readonly mysqlService: MysqlService) {}

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
    return result;
  }
}
