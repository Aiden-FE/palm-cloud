import { convertObjectToSQLWhere, generateMD5 } from '@app/common';
import { MysqlService } from '@app/mysql';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly mysqlService: MysqlService) {}

  async queryUserInfo(
    params: Record<string, string | number>,
    options?: {
      includes?: ('roles' | 'permissions')[];
      excludeFields?: string[];
    },
  ) {
    const opt = {
      enabled: 1,
      ...params,
    } as Record<string, string | number>;
    if (opt.password) {
      opt.password = generateMD5(opt.password as string);
    }
    return await this.mysqlService.transaction(async (connection) => {
      const [result] = await connection.query(
        `SELECT id,uid,country_code,telephone,email,name,nickname,gender,birthday FROM users WHERE ${convertObjectToSQLWhere(opt)}`,
      );
      const user = result?.[0] || null;
      if (user && options?.includes?.includes('roles')) {
        const [roleResult] = await connection.query(`SELECT role_id FROM _user_roles WHERE user_id = ${user?.id}`);
        user.roles = roleResult?.[0] || [];
      }
      delete user.id;
      return user;
    });
  }
}
