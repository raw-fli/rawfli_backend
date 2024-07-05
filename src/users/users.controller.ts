import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TypedBody, TypedParam, TypedRoute } from '@nestia/core';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @TypedRoute.Post()
  create(@TypedBody() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @TypedRoute.Get()
  findAll() {
    return this.usersService.findAll();
  }

  @TypedRoute.Get(':id')
  findOne(@TypedParam('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @TypedRoute.Patch(':id')
  update(
    @TypedParam('id') id: string,
    @TypedBody() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(+id, updateUserDto);
  }

  @TypedRoute.Delete(':id')
  remove(@TypedParam('id') id: string) {
    return this.usersService.remove(+id);
  }
}
