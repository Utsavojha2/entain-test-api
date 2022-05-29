import { InMemoryDBModule } from '@nestjs-addons/in-memory-db';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';

@Module({
  imports: [InMemoryDBModule.forFeature('one', {})],
  controllers: [UserController]
})
export class UserModule {}
