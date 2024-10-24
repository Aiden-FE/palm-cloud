import { BusinessStatus, HttpResponse } from '@app/common';
import { MysqlService } from '@app/mysql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TagsService {
  constructor(private readonly mysqlService: MysqlService) {}
  async updateTag(params: { ownerId: string; id: number; name: string; color?: string }) {
    let sql = 'UPDATE resource_tags SET';
    const sqlParams = [] as string[];
    if (!params.name && !params.color) {
      return new HttpResponse({
        statusCode: BusinessStatus.BAD_REQUEST,
        message: '未提供待更新的内容',
      });
    }
    if (params.name) {
      sql += ' name = ?';
      sqlParams.push(params.name);
    }
    if (params.color) {
      sql += ' color = ?';
      sqlParams.push(params.color);
    }
    sql += ' WHERE ownerId = ? AND id = ?';
    await this.mysqlService.client.query(sql, sqlParams);
    return true;
  }

  async deleteTags(params: { ownerId: string; ids: number[] }) {
    return this.mysqlService.transaction(async (connection) => {
      // 只允许删除自己创建的标签
      const [list] = await connection.query('SELECT * FROM resource_tags WHERE ownerId = ? AND id IN (?)', [
        params.ownerId,
        params.ids,
      ]);
      const targetIds = (list as any[]).map((item) => item.id);
      await connection.query('DELETE FROM resource_tags WHERE ownerId = ? AND id IN (?)', [params.ownerId, targetIds]);
      await connection.query('DELETE FROM _resource_tags WHERE tagId IN (?)', [targetIds]);
    });
  }

  async createTag(params: { ownerId: string; name: string; color?: string }) {
    await this.mysqlService.client.query('INSERT INTO resource_tags(name, color, ownerId) VALUES(?, ?, ?)', [
      params.name,
      params.color || '#3c9cff',
      params.ownerId,
    ]);
    return true;
  }

  async getTags(params: { ownerId: string; keyword?: string }) {
    const result = await this.mysqlService.client.query(
      `SELECT * FROM resource_tags WHERE ownerId = ? AND name LIKE ?`,
      [params.ownerId, `%${params.keyword || ''}%`],
    );
    return result[0];
  }
}
