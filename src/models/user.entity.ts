import { InMemoryDBEntity } from "@nestjs-addons/in-memory-db";
import { IsNotEmpty, IsString } from 'class-validator';

export interface UserEntity extends InMemoryDBEntity {
    username: string;
}

export class UserRegisterDto {
    @IsString()
    @IsNotEmpty()
    public username: string;
}