import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-admin-token'];

    if (!token || token !== process.env.ADMIN_TOKEN) {
      throw new UnauthorizedException('Доступ запрещён');
    }

    return true;
  }
}
