import { InjectInMemoryDBService, InMemoryDBService } from "@nestjs-addons/in-memory-db";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { UserEntity } from "src/models/user.entity";

@Injectable()
export class WsGuard implements CanActivate {

  constructor(
    @InjectInMemoryDBService('one') private userService: InMemoryDBService<UserEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean>  {
    try {
      const wsData = context.switchToWs().getClient();
      const userIdToken = wsData.handshake.headers.userid;
      const currentUser = this.userService.get(userIdToken);
      if(!currentUser) {
        throw new WsException('Unauthorized');
      }
      context.switchToHttp().getRequest().user = currentUser;
      return !!currentUser;
    } catch(err) {
      throw new WsException(err.message)
    }
  }
}
