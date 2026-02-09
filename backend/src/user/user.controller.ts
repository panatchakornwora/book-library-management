import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthUserPayload } from '../auth/auth.types';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserDocument } from './documents/create-user.document';
import { DeleteUserDocument } from './documents/delete-user.document';
import { GetUserDocument } from './documents/get-user.document';
import { ListUsersDocument } from './documents/list-users.document';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @GetUserDocument()
  user(@Req() req: { user: AuthUserPayload }) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @CreateUserDocument()
  create(@Body() dto: CreateUserDto, @Req() req: { user: AuthUserPayload }) {
    return this.userService.create(dto, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('list')
  @ListUsersDocument()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const p = page ? Number(page) : 1;
    const ps = pageSize ? Number(pageSize) : 20;
    return this.userService.list(p, ps);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  @DeleteUserDocument()
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
  }
}
