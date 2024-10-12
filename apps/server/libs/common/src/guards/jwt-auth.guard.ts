import { CanActivate, ExecutionContext, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_KEY, IS_PUBLIC_KEY } from '@app/common';
import { FastifyRequest } from 'fastify';
import { RedisService } from '@app/redis';
import { JwtService } from '@nestjs/jwt';
import { MysqlService } from '@app/mysql';
// import { RpcException } from '@nestjs/microservices';

export default class JWTAuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private reflector: Reflector,
    @Inject(RedisService) private redisService: RedisService,
    @Inject(JwtService) private jwtService: JwtService,
    @Inject(MysqlService) private mysqlService: MysqlService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 使用了 @Public() 装饰器的不做校验
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // 公共接口放行
    if (isPublic) {
      return true;
    }
    const httpCtx = context.switchToHttp();
    // user的来源请根据业务逻辑处理,或从headers头解析出来
    const req = httpCtx.getRequest<FastifyRequest>();
    if (!req.headers.authorization) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    let user: any;
    const tokenKey = `guard.token.${req.headers.authorization}`;
    const catcheUser = await this.redisService.client.get(tokenKey);
    if (catcheUser) {
      user = JSON.parse(catcheUser);
      if (user.exp * 1000 < Date.now()) {
        user = null;
        await this.redisService.client.del(tokenKey);
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    } else {
      try {
        const decodeUser = await this.jwtService.verify(req.headers.authorization);
        if (decodeUser.roles?.length) {
          const [result] = await this.mysqlService.client.query(
            'SELECT * FROM `_role_permissions`  WHERE role_id IN (?)',
            [decodeUser.roles],
          );
          decodeUser.permissions = result?.[0].map((item) => item.permission_key) || [];
        } else {
          decodeUser.permissions = [];
        }

        await this.redisService.client.set(tokenKey, JSON.stringify(decodeUser), { PX: 1000 * 60 * 60 });
        user = decodeUser;
      } catch {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    }
    // const rpcCtx = context.switchToRpc();
    // const { user } = rpcCtx.getData();
    if (!user || !user.permissions) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      // 微服务可以抛出该错误
      // throw new RpcException(
      //   new HttpResponse({
      //     httpStatus: HttpStatus.UNAUTHORIZED,
      //     message: 'Unauthorized',
      //   }).getMicroServiceResponse(),
      // );
    }
    const option = this.reflector.getAllAndOverride<{ mode: 'AND' | 'OR'; permissions: string[] }>(AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // 如果未使用 @Auth() 装饰器的接口意味着不需要具体权限码授权,有token即可
    if (!option || !option.permissions?.length) return true;
    let valid: boolean;
    if (option.mode === 'AND') {
      // AND 权限处理
      valid = option.permissions.reduce<boolean>((result, key) => {
        if (!result) return false;
        return user.permissions.includes(key);
      }, true);
    } else {
      // OR 权限处理
      valid = option.permissions.some((key) => user.permissions.includes(key));
    }
    if (!valid) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      // 微服务可以抛出该错误
      // throw new RpcException(
      //   new HttpResponse({
      //     httpStatus: HttpStatus.UNAUTHORIZED,
      //     message: 'Unauthorized',
      //   }).getMicroServiceResponse(),
      // );
    }
    return true;
  }
}
