import { InjectInMemoryDBService, InMemoryDBService } from '@nestjs-addons/in-memory-db';
import { Body, Controller, Get, Param, Post, UnauthorizedException } from '@nestjs/common';
import { UserEntity, UserRegisterDto } from 'src/models/user.entity'

@Controller('/users')
export class UserController {
    constructor(
        // private readonly userService: InMemoryDBService<UserEntity>
        @InjectInMemoryDBService('one') private readonly userService: InMemoryDBService<UserEntity>
    ) {}

    @Get()
    getAllUsers(): Array<UserEntity> {
        return this.userService.getAll();
    }

    @Get('/:id')
    getUser(@Param('id') id: string) {
        const getCurrentUser = this.userService.get(id);
        if(!getCurrentUser) {
            throw new UnauthorizedException()
        }
        return getCurrentUser;
    }

    @Post()
    registerUser(@Body() registerPayload: UserRegisterDto) {
       return this.userService.create(registerPayload);
    }
}
